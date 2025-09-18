import {
  Injectable,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentStatus } from './types/enums';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/update-payment.dto';
import { PaymentRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly paymentRepo: PaymentRepository,
  ) {}

  /** Crea el PaymentIntent en Stripe y persiste el vínculo en tu DB */
  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const idempotencyKey = `pi-${dto.subscriptionId ?? 'single'}-${Date.now()}`;

    // Normalizar moneda
    dto.currency = (dto.currency || '').toLowerCase();
    if (dto.currency === 'ar') dto.currency = 'ars';

    // 1) Crear el PaymentIntent en Stripe (sin redirecciones)
    const intent = await this.stripe.paymentIntents.create(
      {
        amount: dto.amount,
        currency: dto.currency,
        description: dto.description,
        receipt_email: dto.receiptEmail,
        metadata: {
          ...dto.metadata,
          subscriptionId: dto.subscriptionId ?? '',
          // ojo: todavía NO sabemos paymentId (tu UUID), lo agregamos luego
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      },
      { idempotencyKey },
    );

    // 2) Persistir tu fila local con lo que devuelve Stripe
    const payment = this.paymentRepo.create({
      ...(dto.subscriptionId ? { subscriptionId: dto.subscriptionId } : {}),
      amount: intent.amount,
      currency: intent.currency,
      providerPaymentId: intent.id,                  // pi_...
      status: intent.status as PaymentStatus,
    });
    await this.paymentRepo.save(payment);

    // 3) Ahora que tenemos tu UUID, lo subimos a Stripe como metadata.paymentId
    try {
      await this.stripe.paymentIntents.update(intent.id, {
        metadata: {
          ...(intent.metadata ?? {}),
          paymentId: payment.id,                     // 🔑 vínculo fuerte
        },
      });
    } catch (e) {
      // No rompas la creación si falla el update de metadata; dejá log
      this.logger.warn(`No se pudo actualizar metadata.paymentId en Stripe: ${(e as Error).message}`);
    }

    return {
      paymentId: payment.id,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  getStripe(): Stripe {
    return this.stripe;
  }

  /**
   * Sincroniza una fila local con Stripe usando el payment_intent.id (pi_...).
   * Si no encuentra por providerPaymentId, cae al metadata.paymentId.
   */
  async syncFromStripe(paymentIntentId: string) {
    // 1) Traer el PaymentIntent real desde Stripe
    const intentResp = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    const pi = intentResp as unknown as Stripe.PaymentIntent;

    // 2) Ubicar tu fila local (primero por providerPaymentId; si no, por metadata.paymentId)
    let payment = await this.paymentRepo.findByProviderPaymentId(paymentIntentId);

    if (!payment) {
      const metaPaymentId = (pi.metadata?.paymentId as string | undefined) ?? undefined;
      if (!metaPaymentId) throw new BadRequestException('Payment not found');

      // Usa los métodos que tengas disponibles en tu repositorio
      // @ts-ignore
      payment =
        (await (this.paymentRepo as any).findById?.(metaPaymentId)) ??
        (await (this.paymentRepo as any).findOne?.({ where: { id: metaPaymentId } }));

      if (!payment) throw new BadRequestException('Payment not found');
    }

    // 3) (Opcional) sumar reembolsos consultando los cargos directamente (tipado 100% seguro)
    //    Si tu entidad no tiene refundedAmount, este bloque no rompe; simplemente no se persiste.
    let refunded = 0;
    try {
      const chargeList = await this.stripe.charges.list({
        payment_intent: pi.id,
        limit: 100,
        expand: ['data.refunds'], // para tener refunds embebidos en cada charge
      });

      for (const ch of chargeList.data) {
        for (const r of ch.refunds?.data ?? []) {
          refunded += r.amount ?? 0;
        }
      }
    } catch {
      // Si fallara, no bloqueamos la sync; refunded queda en 0
    }

    // 4) Determinar nuevo estado (si tu enum tiene REFUNDED y es total, usarlo)
    const hasRefundedStatus = (PaymentStatus as any).REFUNDED !== undefined;
    const isFullyRefunded = refunded >= (pi.amount ?? 0);

    const newStatus: PaymentStatus =
      hasRefundedStatus && isFullyRefunded
        ? (PaymentStatus as any).REFUNDED
        : (pi.status as PaymentStatus);

    // 5) Actualizar tu fila local
    payment.status = newStatus;
    payment.amount = pi.amount;
    payment.currency = pi.currency;

    // Guardar refundedAmount si tu entidad lo tiene
    if ('refundedAmount' in payment) {
      (payment as any).refundedAmount = refunded;
    }

    // Refuerza el vínculo si faltaba
    if (!payment.providerPaymentId) {
      payment.providerPaymentId = pi.id;
    }

    await this.paymentRepo.save(payment);
    return payment;
  }


  async refund(dto: RefundPaymentDto) {
    const charges = await this.stripe.charges.list({
      payment_intent: dto.paymentIntentId,
      limit: 1,
    });
    const charge = charges.data[0];
    if (!charge) throw new BadRequestException('No charge to refund');

    const refund = await this.stripe.refunds.create({
      charge: charge.id,
      amount: dto.amount,
    });

    // Refrescar tu fila (captura refundedAmount y status)
    await this.syncFromStripe(dto.paymentIntentId);

    return { refundId: refund.id, status: refund.status };
  }

  /** usado por webhook de invoices (suscripciones) */
  async upsertFromInvoice(invoice: Stripe.Invoice) {
    const paymentIntent = invoice['payment_intent'];
    const piId =
      typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;

    if (typeof piId !== 'string') {
      throw new Error('Payment intent ID is not a string');
    }
    if (!piId) return;

    const existing = await this.paymentRepo.findByProviderPaymentId(piId);
    const amount = invoice.amount_paid ?? invoice.amount_due ?? 0;

    if (existing) {
      existing.status =
        invoice.status === 'paid' ? PaymentStatus.SUCCEEDED : existing.status;
      existing.providerInvoiceId = invoice.id; // id de la invoice en Stripe
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
      // subscriptionId: (si mapeás sub_... -> uuid)
    });
    return this.paymentRepo.save(payment);
  }

  // payments.service.ts (dentro de la clase PaymentsService)
  async confirm(paymentIntentId: string, paymentMethod: string) {
    // 1) Confirmar el PaymentIntent en Stripe
    const intent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethod,
    });

    // 2) Buscar tu fila local (primero por providerPaymentId)
    let payment = await this.paymentRepo.findByProviderPaymentId(paymentIntentId);

    // 3) Fallback: si no hay fila, intentar con metadata.paymentId (tu UUID)
    if (!payment) {
      const metaPaymentId = (intent.metadata?.paymentId as string | undefined) ?? undefined;
      if (metaPaymentId) {
        // Usa el/los métodos reales de tu repo
        // @ts-ignore
        payment =
          (await (this.paymentRepo as any).findById?.(metaPaymentId)) ??
          (await (this.paymentRepo as any).findOne?.({ where: { id: metaPaymentId } }));
      }
    }

    // 4) Si no hay fila local, devolvemos el estado de Stripe (y logeamos)
    if (!payment) {
      this.logger.warn(
        `confirm(): no se encontró fila local para ${paymentIntentId}; devolviendo estado de Stripe.`,
      );
      return { stripe: { id: intent.id, status: intent.status } };
    }

    // 5) Actualizar fila local con lo que devolvió Stripe
    //    (usá el mismo enum PaymentStatus que usa tu entidad)
    payment.status = intent.status as any;
    payment.amount = intent.amount;
    payment.currency = intent.currency;
    if (!payment.providerPaymentId) payment.providerPaymentId = intent.id;

    await this.paymentRepo.save(payment);

    // 6) (Opcional) Sincronización completa para capturar refunds, etc.
    try {
      await this.syncFromStripe(intent.id);
    } catch (e) {
      this.logger.warn(`confirm(): sync post-confirm falló: ${(e as Error).message}`);
    }

    return {
      id: payment.id,
      providerPaymentId: payment.providerPaymentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
    };
  }

}
