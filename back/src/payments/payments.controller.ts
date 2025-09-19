// src/payments/payments.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  BadRequestException, // ← agregado para validar amount
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  CreateCheckoutPaymentDto,
  CreateCheckoutSubscriptionDto,
} from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/update-payment.dto';
import * as express from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// convierto centavos a peso
const toMinorUnits = (major?: number) =>
  typeof major === 'number' ? Math.round(major * 100) : undefined;

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Crear sesión de Checkout de pago normal/ En front seria el botón de llamar
  @Post('checkout/session')
  @ApiOperation({ summary: 'Create one-time payment Checkout Session' })
  @ApiBody({
    type: CreateCheckoutPaymentDto,
    examples: {
      usd: {
        summary: 'USD example (major units)',
        value: {
          amount: 499,
          currency: 'usd',
          description: 'Monthly subscription - PRO Plan',
          receiptEmail: 'customer@example.com',
          successUrl:
            'http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: 'http://localhost:5173/checkout/cancel',
          metadata: { orderId: 'ORD-2025-000123', source: 'web' },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Checkout Session created',
    schema: {
      example: {
        id: 'cs_test_a1b2c3',
        url: 'https://checkout.stripe.com/c/pay/cs_test_a1b2c3',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  createCheckoutPayment(@Body() dto: CreateCheckoutPaymentDto) {

    const cents = toMinorUnits(dto.amount);
    if (!cents || cents < 1) {
      throw new BadRequestException('Amount must be a positive number');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.paymentsService.createCheckoutPaymentSession({
      ...dto,
      amount: cents,
    } as any);
  }

  // ver detalle de pago, consultar estado y detalle... es para pago normal
  @Get('checkout/session/:id')
  @ApiOperation({ summary: 'Get Checkout Session details' })
  @ApiParam({ name: 'id', description: 'Checkout Session ID (cs_...)' })
  @ApiOkResponse({
    description: 'Checkout Session retrieved',
    schema: {
      example: {
        id: 'cs_test_a1b2c3',
        payment_status: 'paid',
        amount_total: 49900, // centavos
        currency: 'usd',
        customer_email: 'customer@example.com',
      },
    },
  })
  getSession(@Param('id') id: string) {
    return this.paymentsService.getCheckoutSession(id);
  }

  // estado de subscripcion de usuario
  @Get('users/:userId/subscription-status')
  @ApiOperation({ summary: 'Get subscription status for a user' })
  @ApiParam({ name: 'userId', description: 'Local user identifier' })
  @ApiOkResponse({
    description: 'Subscription status retrieved',
    schema: {
      example: {
        userId: 'bd0a0a5e-2f0c-4e7e-9a0f-5b5c3c8a9e12',
        status: 'active',
        currentPeriodEnd: '2025-10-31T23:59:59.000Z',
        priceId: 'price_1QWERTYUiopASDFGHJKL',
      },
    },
  })
  getSubStatus(@Param('userId') userId: string) {
    return this.paymentsService.getSubscriptionStatusForUser(userId);
  }

  // Webhook (validación de firma + ruteo de eventos) no se llama ni desde el back nii en front, solo se comunica con stripe
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe Webhook endpoint' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe signature header',
    required: true,
  })
  @ApiOkResponse({
    description: 'Event processed',
    schema: { example: { received: true } },
  })
  async webhook(@Req() req: express.Request, @Res() res: express.Response) {
    const sigHeader = req.headers['stripe-signature'];
    if (!sigHeader || Array.isArray(sigHeader)) {
      return res.status(400).send('Missing or invalid stripe-signature header');
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return res.status(500).send('Webhook secret not configured');

    let event;
    try {
      const stripe = this.paymentsService.getStripe();
      const buf = (req as any).rawBody as Buffer;
      event = stripe.webhooks.constructEvent(buf, sigHeader, secret);
    } catch (e: any) {
      return res.status(400).send(`Webhook signature invalid: ${e.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
      case 'payment_intent.processing': {
        const pi = event.data.object as any;
        await this.paymentsService.syncFromStripe(pi.id);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await this.paymentsService.applyCheckoutCompleted(session);
        break;
      }
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        await this.paymentsService.upsertFromInvoice(invoice);
        break;
      }
    }

    return res.send({ received: true });
  }

  // reembolso de pago
  @Post('refund')
  @ApiOperation({ summary: 'Refund a PaymentIntent (full or partial)' })
  @ApiBody({
    type: RefundPaymentDto,
    examples: {
      full: {
        summary: 'Full refund',
        value: { paymentIntentId: 'pi_3S977vFomeILf1I40I92ZV3w' },
      },
      partial: {
        summary: 'Partial refund (major units)',
        value: { paymentIntentId: 'pi_3S977vFomeILf1I40I92ZV3w', amount: 200 }, 
      },
    },
  })
  @ApiOkResponse({
    description: 'Refund created',
    schema: {
      example: {
        refundId: 're_1AbCdEfGh',
        status: 'succeeded',
        amount: 20000,
        currency: 'usd',
        payment_intent: 'pi_3QabcDEFghijklMN0pQRsTUV',
      },
    },
  })
  refund(@Body() dto: RefundPaymentDto) {
    const cents = toMinorUnits(dto.amount);

    return this.paymentsService.refund({
      ...dto,
      amount: cents,
    } as any);
  }

  // crea sesion de pago y redireccion... por susbripcion
  @Post('checkout/subscription')
  @ApiOperation({ summary: 'Create subscription Checkout Session' })
  @ApiBody({
    type: CreateCheckoutSubscriptionDto,
    examples: {
      basic: {
        summary: 'Basic subscription (priceId)',
        value: {
          priceId: 'price_1QWERTYUiopASDFGHJKL',
          quantity: 1,
          successUrl:
            'http://localhost:5173/subscribe/success?session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: 'http://localhost:3000/subscribe/cancel',
          trialDays: 7,
          metadata: { plan: 'pro', source: 'mobile' },
          userId: 'bd0a0a5e-2f0c-4e7e-9a0f-5b5c3c8a9e12',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Checkout Session created',
    schema: {
      example: {
        id: 'cs_test_sub_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_sub_123',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  createCheckoutSubscription(@Body() dto: CreateCheckoutSubscriptionDto) {
    return this.paymentsService.createCheckoutSubscriptionSession(dto);
  }
}
