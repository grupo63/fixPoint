import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import {
  CreateCheckoutPaymentDto,
  CreateCheckoutSubscriptionDto,
} from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { PaymentRepository } from './payments.repository';
import {
  Subscription,
  SubscriptionStatus,
} from 'src/subscription/entities/subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { NotificationsService } from 'src/notifications/notification.service';
import { PaymentEmailPayload } from 'src/notifications/dto/paymentEmail.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly paymentRepo: PaymentRepository,
    @InjectRepository(Payment)
    private readonly paymentOrmRepo: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createCheckoutPaymentSession(dto: CreateCheckoutPaymentDto) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: dto.currency,
            product_data: { name: dto.description },
            unit_amount: dto.amount,
          },
          quantity: 1,
        },
      ],
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      customer_email: dto.receiptEmail,
      metadata: dto.metadata,
    });
    const payment = this.paymentRepo.create({
      amount: dto.amount,
      currency: dto.currency,
      status: PaymentStatus.PROCESSING,
      providerCheckoutSessionId: session.id,
      checkoutMode: 'payment',
    });
    await this.paymentRepo.save(payment);
    return { url: session.url, sessionId: session.id, paymentId: payment.id };
  }

  async createCheckoutSubscriptionSession(dto: CreateCheckoutSubscriptionDto) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: dto.priceId, quantity: dto.quantity ?? 1 }],
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: { ...dto.metadata, userId: dto.userId ?? '' },
      subscription_data: { trial_period_days: dto.trialDays ?? undefined },
    });
    const payment = this.paymentRepo.create({
      status: PaymentStatus.PROCESSING,
      providerCheckoutSessionId: session.id,
      checkoutMode: 'subscription',
    });
    await this.paymentRepo.save(payment);
    return { url: session.url, sessionId: session.id, paymentId: payment.id };
  }

  async applyCheckoutCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`Procesando checkout.session.completed para la sesión: ${session.id}`);
    const payment = await this.paymentRepo.findByCheckoutSessionId(session.id);
    if (!payment) {
      this.logger.error(
        `CRITICAL: No se encontró el registro de pago para la sesión ${session.id}.`,
      );
      return;
    }

    const piId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
    if (piId) payment.providerPaymentId = piId;

    if (session.mode === 'subscription') {
      const subId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;
      const userId = session.metadata?.userId;

      if (!subId || !userId) {
        this.logger.error(
          `CRITICAL: Falta stripeSubscriptionId o userId en la metadata de la sesión ${session.id}.`,
        );
        return;
      }
      
      const stripeSub = await this.stripe.subscriptions.retrieve(subId, {
        expand: ['latest_invoice'],
      });
      
      let localSub = await this.subscriptionRepo.findOne({ where: { stripeSubscriptionId: stripeSub.id } });

      if (!localSub) {
        const invoice = stripeSub.latest_invoice as Stripe.Invoice;
        const periodEndTimestamp = invoice.period_end;

        if (!periodEndTimestamp) {
            this.logger.error(`CRITICAL: La factura ${invoice.id} no tiene fecha de fin de período.`);
            return;
        }

        localSub = this.subscriptionRepo.create({
            userId: userId,
            stripeSubscriptionId: stripeSub.id,
            stripePriceId: stripeSub.items.data[0].price.id,
            quantity: stripeSub.items.data[0].quantity,
            status: stripeSub.status as SubscriptionStatus,
            currentPeriodEnd: new Date(periodEndTimestamp * 1000),
        });
        await this.subscriptionRepo.save(localSub);
        this.logger.log(`Nueva suscripción local creada con ID: ${localSub.id}`);
      }
      payment.subscription = localSub;
      payment.stripeSubscriptionId = localSub.stripeSubscriptionId;
    }

    let isPaymentSucceeded = false;
    switch (session.payment_status) {
      case 'paid':
      case 'no_payment_required':
        payment.status = PaymentStatus.SUCCEEDED;
        isPaymentSucceeded = true;
        break;
      case 'unpaid':
        payment.status = PaymentStatus.REQUIRES_PAYMENT_METHOD;
        break;
      default:
        payment.status = PaymentStatus.PROCESSING;
        break;
    }

    await this.paymentRepo.save(payment);
    this.logger.log(
      `Pago ${payment.id} actualizado correctamente al estado: ${payment.status}`,
    );
    
    // 3️⃣ LÓGICA PARA ENVIAR CORREO DESPUÉS DE UN PAGO EXITOSO
    if (isPaymentSucceeded) {
      try {
        const userId = session.metadata?.userId;
        if (!userId) {
          this.logger.warn(`No se encontró userId en la metadata de la sesión ${session.id}.`);
          return;
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
          this.logger.warn(
            `No se pudo encontrar el usuario para el userId ${userId}.`,
          );
           return;
        }

        const payload: PaymentEmailPayload = {
          email: user.email,
          name: user.firstName || 'Usuario',
          amount: payment.amount,
          date: payment.createdAt.toISOString(),
          transactionId: payment.providerPaymentId!,
          method: 'Stripe',
        };
        await this.notificationsService.sendPaymentConfirmationEmail(payload);
        this.logger.log(`Correo de confirmación de pago enviado a ${user.email}`);

      } catch (error: any) {
        this.logger.error(
          'Fallo al enviar el correo de confirmación de pago',
          error.message || error,
        );
      }
    }
  }

  async createPaymentFromInvoice(invoice: Stripe.Invoice) {
    if (invoice.billing_reason !== 'subscription_cycle') {
      this.logger.log(`Ignorando factura ${invoice.id} por razón: ${invoice.billing_reason}`);
      return;
    }

    const invoiceId = invoice.id;
    const subscription = (invoice as any).subscription;
    const paymentIntent = (invoice as any).payment_intent;
    const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id;
    const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;
    
    if (!invoiceId || !subscriptionId) {
      this.logger.warn(`Factura ${invoiceId} sin ID de suscripción. Ignorando.`);
      return;
    }
    
    const existingPayment = await this.paymentOrmRepo.findOne({ where: { providerInvoiceId: invoiceId } });
    if (existingPayment) {
      this.logger.log(`El pago para la factura ${invoiceId} ya existe.`);
      return;
    }

    const newPayment = this.paymentRepo.create({
      status: PaymentStatus.PROCESSING,
      amount: invoice.amount_due,
      currency: invoice.currency,
      providerInvoiceId: invoiceId,
      stripeSubscriptionId: subscriptionId,
      providerPaymentId: paymentIntentId,
      checkoutMode: 'subscription',
    });
    
    await this.paymentRepo.save(newPayment);
    this.logger.log(`Pago local creado (ID: ${newPayment.id}) para la factura de renovación ${invoiceId}.`);
  }
  
  async getSubscriptionStatusForUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const { password, ...userProfile } = user;
    return {
      ...userProfile,
      subscriptionStatus: subscription ? subscription.status : 'inactive',
      subscriptionEndsAt: subscription ? subscription.currentPeriodEnd : null,
    };
  }
  
  async cancelSubscription(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (!subscription || !subscription.stripeSubscriptionId)
      throw new BadRequestException(
        'No se encontró una suscripción activa para este usuario.',
      );
    await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    return { message: 'Tu suscripción ha sido programada para cancelación.' };
  }

  getStripe(): Stripe {
    return this.stripe;
  }

  async getGlobalStats() {
    const totalPayments = await this.paymentOrmRepo.count();
    const totalSucceeded = await this.paymentOrmRepo.count({
      where: { status: PaymentStatus.SUCCEEDED },
    });
    const totalProcessing = await this.paymentOrmRepo.count({
      where: { status: PaymentStatus.PROCESSING },
    });

    const sumResult = await this.paymentOrmRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'totalAmount')
      .addSelect('COUNT(DISTINCT p.stripeSubscriptionId)', 'totalSubscriptions')
      .getRawOne<{ totalAmount: string; totalSubscriptions: string }>();

    // Manejo de undefined
    const totalAmount = sumResult?.totalAmount
      ? Number(sumResult.totalAmount)
      : 0;
    const totalSubscriptions = sumResult?.totalSubscriptions
      ? Number(sumResult.totalSubscriptions)
      : 0;

    return {
      totalPayments,
      totalSucceeded,
      totalProcessing,
      totalAmount,
      totalSubscriptions,
    };
  }
}
