import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentRepository } from './payments.repository';
import { PaymentStatus } from './entities/payment.entity';
import {
  CreateCheckoutPaymentDto,
  CreateCheckoutSubscriptionDto,
} from './dto/create-payment.dto';
import { Repository } from 'typeorm';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RefundPaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly paymentRepo: PaymentRepository,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async createCheckoutPaymentSession(dto: CreateCheckoutPaymentDto) {
    const currency =
      (dto.currency || '').toLowerCase() === 'ar'
        ? 'ars'
        : (dto.currency || '').toLowerCase();

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
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
      automatic_tax: { enabled: false },
    });

    const payment = this.paymentRepo.create({
      amount: dto.amount,
      currency,
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
      line_items: [
        {
          price: dto.priceId,
          quantity: dto.quantity ?? 1,
        },
      ],
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: { ...dto.metadata, userId: dto.userId ?? '' },
      subscription_data: {
        trial_period_days: dto.trialDays ?? undefined,
        metadata: { userId: dto.userId ?? '' },
      },
      allow_promotion_codes: true,
    });

    const payment = this.paymentRepo.create({
      amount: 0,
      currency: 'usd',
      status: PaymentStatus.PROCESSING,
      providerCheckoutSessionId: session.id,
      checkoutMode: 'subscription',
      subscriptionId: undefined,
    });
    await this.paymentRepo.save(payment);

    return { url: session.url, sessionId: session.id, paymentId: payment.id };
  }

  async getCheckoutSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription', 'customer'],
    });
  }

  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const csId = session.id;

    const payment = await this.paymentRepo.findByCheckoutSessionId(csId);
    if (!payment) {
      this.logger.warn(
        `[checkout.session.completed] No local payment for session ${csId}`,
      );
      return;
    }

    if (session.mode === 'subscription') {
      const subId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;
      if (subId) payment.subscriptionId = subId;

      const invId =
        typeof session.invoice === 'string'
          ? session.invoice
          : session.invoice?.id;
      if (invId) payment.providerInvoiceId = invId;

    }

    if (session.mode === 'payment') {
      const piId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;
      if (piId) payment.providerPaymentId = piId;
    }

    await this.paymentRepo.save(payment);
  }

  async upsertFromInvoice(invoice: Stripe.Invoice) {
    const paymentIntent = (invoice as any)['payment_intent'];
    const piId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;
    if (!piId) return;

    const subField = (invoice as any)['subscription'];
    const subId =
      typeof subField === 'string' ? subField : (subField?.id ?? undefined);

    const amount = invoice.amount_paid ?? invoice.amount_due ?? 0;

    const existing = await this.paymentRepo.findByProviderPaymentId(piId);
    if (existing) {
      existing.status = invoice.status === 'paid' ? PaymentStatus.SUCCEEDED : existing.status;
      existing.providerInvoiceId = invoice.id;
      existing.amount = amount || existing.amount;
      existing.currency = invoice.currency || existing.currency;
      if (subId) existing.subscriptionId = subId;
      await this.paymentRepo.save(existing);
      return existing;
    }

    const payment = this.paymentRepo.create({
      providerPaymentId: piId,
      providerInvoiceId: invoice.id,
      amount,
      currency: invoice.currency,
      status:
        invoice.status === 'paid'
          ? PaymentStatus.SUCCEEDED
          : PaymentStatus.PROCESSING,
      subscriptionId: subId,
    });
    return this.paymentRepo.save(payment);
  }

  getStripe(): Stripe {
    return this.stripe;
  }

  async getSubscriptionStatusForUser(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!subscription) {
      return { status: 'no_subscription' };
    }

    return {
      status: subscription.status,
      subscriptionId: subscription.id,
    };
  }

  async refund(dto: RefundPaymentDto) {
    const stripe = this.getStripe();

    const refund = await stripe.refunds.create({
      payment_intent: dto.paymentIntentId,
      amount: dto.amount,
    });

    const charge = refund.charge
      ? (typeof refund.charge === 'string'
        ? await stripe.charges.retrieve(refund.charge)
        : refund.charge)
      : null;

    const total = charge?.amount ?? 0;
    const refundedSoFar = charge?.amount_refunded ?? refund.amount ?? 0;
    const isFullRefund = charge?.refunded === true || refundedSoFar >= total;
    const refundableRemaining = Math.max(total - refundedSoFar, 0);

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount ?? null,
      currency: refund.currency ?? null,
      paymentIntentId: typeof refund.payment_intent === 'string'
        ? refund.payment_intent
        : refund.payment_intent?.id,
      chargeId: typeof refund.charge === 'string' ? refund.charge : refund.charge?.id,
      isFullRefund,
      refundedSoFar,
      refundableRemaining,
    };
  }

  async applyCheckoutCompleted(session: Stripe.Checkout.Session) {
    let payment = await this.paymentRepo.findByCheckoutSessionId(session.id);

    // Detectar payment_intent id (si viene expandido o como string)
    let piId: string | undefined;
    if (typeof session.payment_intent === 'string') piId = session.payment_intent;
    else if (
      session.payment_intent &&
      typeof session.payment_intent === 'object'
    )
      piId = session.payment_intent.id;

    if (!payment && piId) {
      payment = await this.paymentRepo.findByProviderPaymentId(piId);
    }

    if (!payment) {
      payment = this.paymentRepo.create({
        providerCheckoutSessionId: session.id,
        checkoutMode: session.mode as any,
        currency: (session.currency as string) ?? 'usd',
        amount: session.amount_total ?? 0,
        status: PaymentStatus.PROCESSING,
      });
    }

    payment.providerCheckoutSessionId = session.id;
    payment.checkoutMode = session.mode as any;
    if (typeof session.currency === 'string') payment.currency = session.currency;
    if (typeof session.amount_total === 'number') payment.amount = session.amount_total;
    if (piId) payment.providerPaymentId = piId;

    // ⬇️ Estado según el tipo de checkout
    if (session.mode === 'payment') {
      // Stripe marca el Session con payment_status: 'paid' | 'unpaid' | 'no_payment_required'
      if (
        session.payment_status === 'paid' ||
        session.payment_status === 'no_payment_required'
      ) {
        payment.status = PaymentStatus.SUCCEEDED;
      } else {
        payment.status = PaymentStatus.PROCESSING;
      }
    } else if (session.mode === 'subscription') {
      // La confirmación final la da invoice.payment_succeeded
      payment.status = PaymentStatus.PROCESSING;
      const subId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;
      if (subId) payment.subscriptionId = subId;

      const invId = typeof session.invoice === 'string'
        ? session.invoice
        : session.invoice?.id;
      if (invId) payment.providerInvoiceId = invId;
    }

    await this.paymentRepo.save(payment);
  }

  async syncFromStripe(paymentIntentId: string) {

    const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    let payment =
      await this.paymentRepo.findByProviderPaymentId(paymentIntentId);

    if (!payment) {
      payment = this.paymentRepo.create({
        providerPaymentId: (pi as any).id,
        amount: (pi as any).amount ?? 0,
        currency: ((pi as any).currency as string) ?? 'usd',
        status: PaymentStatus.PROCESSING,
      });
    }

    payment.amount = (pi as any).amount ?? payment.amount;
    payment.currency = ((pi as any).currency as string) ?? payment.currency;

    const charges = await this.stripe.charges.list({
      payment_intent: paymentIntentId,
      limit: 100,
    });
    const refunded = (charges.data ?? []).reduce(
      (acc, ch) => acc + (ch.amount_refunded ?? 0),
      0,
    );
    payment.refundedAmount = refunded;

    switch ((pi as any).status as string) {
      case 'succeeded':
        payment.status = PaymentStatus.SUCCEEDED;
        break;
      case 'processing':
        payment.status = PaymentStatus.PROCESSING;
        break;
      case 'requires_payment_method':
        payment.status = PaymentStatus.REQUIRES_PAYMENT_METHOD;
        break;
      case 'canceled':
        payment.status = PaymentStatus.CANCELED;
        break;
      default:
        break;
    }

    await this.paymentRepo.save(payment);
    return payment;
  }
}
