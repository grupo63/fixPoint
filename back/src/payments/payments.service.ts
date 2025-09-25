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
      line_items: [{
        price_data: {
          currency: dto.currency,
          product_data: { name: dto.description },
          unit_amount: dto.amount,
        },
        quantity: 1,
      }],
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
    let estimatedAmount = 0;
    let currency = 'usd';
    try {
      const price = await this.stripe.prices.retrieve(dto.priceId);
      estimatedAmount = (price.unit_amount || 0) * (dto.quantity ?? 1);
      currency = price.currency || 'usd';
    } catch (error) {
      this.logger.warn(`No se pudo obtener el precio ${dto.priceId}: ${error.message}`);
    }

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
      amount: estimatedAmount,
      currency: currency,
    });
    await this.paymentRepo.save(payment);
    return { url: session.url, sessionId: session.id, paymentId: payment.id };
  }

  async applyCheckoutCompleted(session: Stripe.Checkout.Session) {
    const payment = await this.paymentRepo.findByCheckoutSessionId(session.id);
    if (!payment) {
      this.logger.error(`CRITICAL: No se encontró el registro de pago para la sesión ${session.id}.`);
      return;
    }

    const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    if (piId) payment.providerPaymentId = piId;

    if (session.amount_total !== null) {
      payment.amount = session.amount_total;
      payment.currency = session.currency || payment.currency;
    }
    
    if (session.mode === 'subscription') {
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const userId = session.metadata?.userId;

        if (!subId || !userId) {
            this.logger.error(`CRITICAL: Falta stripeSubscriptionId o userId en la sesión ${session.id}`);
            return;
        }

        const stripeSub = await this.stripe.subscriptions.retrieve(subId, { expand: ['latest_invoice'] });
        let localSub = await this.subscriptionRepo.findOne({ where: { stripeSubscriptionId: stripeSub.id } });

        if (!localSub) {
            const invoice = stripeSub.latest_invoice as Stripe.Invoice;
            // --- CORRECCIÓN DE TIPO APLICADA AQUÍ ---
            const periodEndTimestamp = invoice?.period_end || (stripeSub as any).current_period_end;
            if (!periodEndTimestamp) {
                this.logger.error(`CRITICAL: No se pudo determinar fecha de fin para sub ${stripeSub.id}`);
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

    if (isPaymentSucceeded) {
        // Lógica de envío de correo
    }
  }

  async createPaymentFromInvoice(invoice: Stripe.Invoice) {
    if (invoice.billing_reason !== 'subscription_cycle') {
        return;
    }
    const invoiceId = invoice.id;
    const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id;
    const paymentIntentId = typeof (invoice as any).payment_intent === 'string' ? (invoice as any).payment_intent : (invoice as any).payment_intent?.id;

    if (!invoiceId || !subscriptionId) return;

    if (await this.paymentOrmRepo.findOne({ where: { providerInvoiceId: invoiceId } })) return;

    const localSub = await this.subscriptionRepo.findOne({ where: { stripeSubscriptionId: subscriptionId } });
    if (!localSub) {
        this.logger.error(`No se encontró sub local para Stripe ID ${subscriptionId} al procesar factura ${invoiceId}.`);
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
        subscription: localSub,
    });
    await this.paymentRepo.save(newPayment);
  }

  async getGlobalStats() {
    const totalPayments = await this.paymentOrmRepo.count();
    const totalSucceeded = await this.paymentOrmRepo.count({ where: { status: PaymentStatus.SUCCEEDED } });
    const totalProcessing = await this.paymentOrmRepo.count({ where: { status: PaymentStatus.PROCESSING } });

    const sumResult = await this.paymentOrmRepo.createQueryBuilder('p')
        .select('COALESCE(SUM(p.amount), 0)', 'totalAmount')
        .where('p.status = :status', { status: PaymentStatus.SUCCEEDED })
        .andWhere('p.amount > 0')
        .getRawOne<{ totalAmount: string }>();

    const totalAmount = sumResult?.totalAmount ? Number(sumResult.totalAmount) : 0;
    const totalSubscriptions = await this.subscriptionRepo.count();

    const succeededWithAmountResult = await this.paymentOrmRepo.createQueryBuilder('p')
        .select('COUNT(*)', 'count')
        .where('p.status = :status', { status: PaymentStatus.SUCCEEDED })
        .andWhere('p.amount > 0')
        .getRawOne<{ count: string }>();

    const succeededWithAmount = succeededWithAmountResult?.count ? parseInt(succeededWithAmountResult.count) : 0;

    return { totalPayments, totalSucceeded, totalProcessing, totalAmount, totalSubscriptions, succeededWithAmount };
  }

  async getStatsByUserId(userId: string) {
    const totalPayments = await this.paymentOrmRepo
      .createQueryBuilder('p')
      .innerJoin('p.subscription', 's')
      .where('s.userId = :userId', { userId })
      .getCount();

    const totalSucceeded = await this.paymentOrmRepo
      .createQueryBuilder('p')
      .innerJoin('p.subscription', 's')
      .where('s.userId = :userId', { userId })
      .andWhere('p.status = :status', { status: PaymentStatus.SUCCEEDED })
      .getCount();

    const totalProcessing = await this.paymentOrmRepo
      .createQueryBuilder('p')
      .innerJoin('p.subscription', 's')
      .where('s.userId = :userId', { userId })
      .andWhere('p.status = :status', { status: PaymentStatus.PROCESSING })
      .getCount();

    const succeededWithAmountResult = await this.paymentOrmRepo
      .createQueryBuilder('p')
      .innerJoin('p.subscription', 's')
      .select('COUNT(*)', 'count')
      .where('s.userId = :userId', { userId })
      .andWhere('p.status = :status', { status: PaymentStatus.SUCCEEDED })
      .andWhere('p.amount IS NOT NULL')
      .andWhere('p.amount > 0')
      .getRawOne<{ count: string }>();

    const succeededWithAmount = succeededWithAmountResult?.count
      ? parseInt(succeededWithAmountResult.count)
      : 0;

    console.log(
      `Usuario ${userId} - Pagos exitosos: ${totalSucceeded}, Con amount válido: ${succeededWithAmount}`,
    );

    const sumResult = await this.paymentOrmRepo
      .createQueryBuilder('p')
      .innerJoin('p.subscription', 's')
      .select('COALESCE(SUM(p.amount), 0)', 'totalAmount')
      .addSelect('COUNT(DISTINCT p.stripeSubscriptionId)', 'totalSubscriptions')
      .where('s.userId = :userId', { userId })
      .andWhere('p.status = :status', { status: PaymentStatus.SUCCEEDED })
      .andWhere('p.amount IS NOT NULL')
      .andWhere('p.amount > 0')
      .getRawOne<{ totalAmount: string; totalSubscriptions: string }>();

    console.log(`Usuario ${userId} - Raw sumResult:`, sumResult);

    const totalAmount = sumResult?.totalAmount
      ? Number(sumResult.totalAmount)
      : 0;
    const totalSubscriptions = sumResult?.totalSubscriptions
      ? Number(sumResult.totalSubscriptions)
      : 0;

    return {
      userId,
      totalPayments,
      totalSucceeded,
      totalProcessing,
      totalAmount,
      totalSubscriptions,
      succeededWithAmount,
    };
  }

  async getSubscriptionStatusForUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    const subscription = await this.subscriptionRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
    const { password, ...userProfile } = user;
    return {
        ...userProfile,
        subscriptionStatus: subscription ? subscription.status : 'inactive',
        subscriptionEndsAt: subscription ? subscription.currentPeriodEnd : null,
    };
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId, status: SubscriptionStatus.ACTIVE } });
    if (!subscription || !subscription.stripeSubscriptionId) throw new BadRequestException('No se encontró una suscripción activa para este usuario.');
    await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    return { message: 'Tu suscripción ha sido programada para cancelación.' };
  }

  // --- MÉTODO 'getStripe' RESTAURADO ---
  getStripe(): Stripe {
    return this.stripe;
  }
}