import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/update-payment.dto';
import Stripe from 'stripe';
import express from 'express';

// === Type-guards (dejar aquí, debajo de los imports) ===
function isPaymentIntent(o: any): o is Stripe.PaymentIntent {
  return o && typeof o === 'object' && o.object === 'payment_intent';
}
function isInvoice(o: any): o is Stripe.Invoice {
  return o && typeof o === 'object' && o.object === 'invoice';
}
// === fin type-guards ===

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(dto);
  }

  @Post('refund')
  refund(@Body() dto: RefundPaymentDto) {
    return this.paymentsService.refund(dto);
  }

  @Get('sync/:paymentIntentId')
  sync(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.syncFromStripe(paymentIntentId);
  }

  // PaymentsController.ts
  @Post('confirm')
  @HttpCode(200)
  confirm(@Body() body: { paymentIntentId: string; paymentMethod?: string }) {
    return this.paymentsService.confirm(
      body.paymentIntentId,
      body.paymentMethod ?? 'pm_card_visa', // por defecto para QA
    );
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: express.Request, @Res() res: express.Response) {
    const sigHeader = req.headers['stripe-signature'];
    if (!sigHeader || Array.isArray(sigHeader)) {
      return res.status(400).send('Missing or invalid stripe-signature header');
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return res.status(500).send('Webhook secret not configured');

    let event: Stripe.Event;
    try {
      // Acceso directo al cliente que ya tenés en el servicio (como venías haciendo)
      const stripe = (this.paymentsService as any)['stripe'] as Stripe;

      const buf = (req as any).rawBody as Buffer;
      event = stripe.webhooks.constructEvent(buf, sigHeader, secret);
    } catch (e: any) {
      // 🔎 Diagnóstico rápido
      const raw = (req as any).rawBody;
      const rawInfo =
        raw && Buffer.isBuffer(raw)
          ? `rawBody(buffer) len=${raw.length}`
          : `rawBody tipo=${typeof raw}`;

      console.error(
        `[Stripe Webhook] constructEvent ERROR: ${e?.message || e} | ${rawInfo}`,
      );

      return res.status(400).send(`Webhook signature invalid: ${e.message}`);
    }

    // Manejo de eventos con type-guards (sin casts que subrayan)
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
      case 'payment_intent.processing': {
        const obj = event.data.object;
        if (isPaymentIntent(obj)) {
          await this.paymentsService.syncFromStripe(obj.id);
        }
        break;
      }
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const obj = event.data.object;
        if (isInvoice(obj)) {
          await this.paymentsService.upsertFromInvoice(obj);
        }
        break;
      }
    }

    return res.send({ received: true });
  }
}
