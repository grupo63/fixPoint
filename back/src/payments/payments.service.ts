import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository, Not, IsNull } from 'typeorm';
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

  // ✅ CORREGIDO: Ahora obtiene y asigna el amount
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

    // ✅ NUEVO: Obtener información del precio desde Stripe para calcular el amount
    let estimatedAmount = 0;
    let currency = 'usd';
    try {
      const price = await this.stripe.prices.retrieve(dto.priceId);
      estimatedAmount = (price.unit_amount || 0) * (dto.quantity ?? 1);
      currency = price.currency || 'usd';
    } catch (error) {
      this.logger.warn(
        `No se pudo obtener el precio ${dto.priceId}: ${error.message}`,
      );
    }

    const payment = this.paymentRepo.create({
      status: PaymentStatus.PROCESSING,
      providerCheckoutSessionId: session.id,
      checkoutMode: 'subscription',
      amount: estimatedAmount, // ✅ Agregamos el amount estimado
      currency: currency, // ✅ Agregamos la moneda
    });
    await this.paymentRepo.save(payment);
    return { url: session.url, sessionId: session.id, paymentId: payment.id };
  }

  // ✅ CORREGIDO: Ahora obtiene el amount real y envía correo
  async applyCheckoutCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(
      `Procesando checkout.session.completed para la sesión: ${session.id}`,
    );
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

    // ✅ NUEVO: Obtener y asignar el amount real desde la sesión
    try {
      if (session.amount_total) {
        payment.amount = session.amount_total;
        payment.currency = session.currency || payment.currency;
      } else if (session.subscription) {
        // Si no está en la sesión, obtenerlo de la suscripción
        const subId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        if (subId) {
          const stripeSub = await this.stripe.subscriptions.retrieve(subId, {
            expand: ['latest_invoice', 'items.data.price'],
          });

          if (stripeSub.latest_invoice) {
            const invoice = stripeSub.latest_invoice as Stripe.Invoice;
            payment.amount = invoice.amount_paid || invoice.amount_due;
            payment.currency = invoice.currency;
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error obteniendo amount para pago ${payment.id}: ${error.message}`,
      );
    }

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

      let localSub = await this.subscriptionRepo.findOne({
        where: { stripeSubscriptionId: stripeSub.id },
      });

      if (!localSub) {
        const invoice = stripeSub.latest_invoice as Stripe.Invoice;
        const periodEndTimestamp = invoice.period_end;

        if (!periodEndTimestamp) {
          this.logger.error(
            `CRITICAL: La factura ${invoice.id} no tiene fecha de fin de período.`,
          );
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
        this.logger.log(
          `Nueva suscripción local creada con ID: ${localSub.id}`,
        );
      }
      payment.subscription = localSub;
      payment.stripeSubscriptionId = localSub.stripeSubscriptionId;
    }

    // ✅ MEJORADO: Determinar si el pago fue exitoso antes de actualizar el status
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
      `Pago ${payment.id} actualizado correctamente al estado: ${payment.status} con amount: ${payment.amount}`,
    );

    // 3️⃣ LÓGICA PARA ENVIAR CORREO DESPUÉS DE UN PAGO EXITOSO
    if (isPaymentSucceeded) {
      try {
        const userId = session.metadata?.userId;
        if (!userId) {
          this.logger.warn(
            `No se encontró userId en la metadata de la sesión ${session.id}.`,
          );
          return;
        }

        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
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
        this.logger.log(
          `Correo de confirmación de pago enviado a ${user.email}`,
        );
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
      this.logger.log(
        `Ignorando factura ${invoice.id} por razón: ${invoice.billing_reason}`,
      );
      return;
    }
    const invoiceId = invoice.id;
    const subscription = (invoice as any).subscription;
    const paymentIntent = (invoice as any).payment_intent;
    const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id;
    const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;

    if (!invoiceId || !subscriptionId) {
      this.logger.warn(
        `Factura ${invoiceId} sin ID de suscripción. Ignorando.`,
      );
      return;
    }
    const existingPayment = await this.paymentOrmRepo.findOne({ where: { providerInvoiceId: invoiceId } });
    if (existingPayment) {
      this.logger.log(`El pago para la factura ${invoiceId} ya existe.`);
      return;
    }
    const localSub = await this.subscriptionRepo.findOne({ where: { stripeSubscriptionId: subscriptionId } });
    if (!localSub) {
      this.logger.error(`No se encontró la suscripción local para Stripe ID ${subscriptionId} al procesar la factura ${invoiceId}.`);
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
      subscription: localSub, // ✅ Enlace correcto
    });
    await this.paymentRepo.save(newPayment);
    this.logger.log(`Pago local creado (ID: ${newPayment.id}) para la factura de renovación ${invoiceId} y asociado al usuario ${localSub.userId}.`);
  }

  // --- MÉTODO DE ESTADÍSTICAS GLOBALES (CORREGIDO) ---
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
      .select('COALESCE(SUM(p.amount), 0)', 'totalAmount')
      .where('p.status = :status', { status: PaymentStatus.SUCCEEDED })
      .andWhere('p.amount > 0') // Solo suma pagos reales, no los de $0 de prueba
      .getRawOne<{ totalAmount: string }>();
    
    const totalAmount = sumResult?.totalAmount ? Number(sumResult.totalAmount) : 0;

    // ✅ CORRECCIÓN: Contamos las suscripciones desde su propia tabla
    const totalSubscriptions = await this.subscriptionRepo.count();

    const succeededWithAmountResult = await this.paymentOrmRepo
      .createQueryBuilder('p')
      .select('COUNT(*)', 'count')
      .where('p.status = :status', { status: PaymentStatus.SUCCEEDED })
      .andWhere('p.amount > 0')
      .getRawOne<{ count: string }>();

    const succeededWithAmount = succeededWithAmountResult?.count ? parseInt(succeededWithAmountResult.count) : 0;

    return {
      totalPayments,
      totalSucceeded,
      totalProcessing,
      totalAmount,
      totalSubscriptions, // ✅ Ahora este dato es correcto
      succeededWithAmount,
    };
  }
  async getSubscriptionStatusForUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user)
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
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
}