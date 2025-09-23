import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  BadRequestException,
  Logger, // Importamos Logger para un mejor registro de errores
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
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  // --- Endpoint para crear sesión de PAGO ÚNICO ---
  @Post('checkout/session')
  @ApiOperation({ summary: 'Crear sesión de Checkout para pago único' })
  @ApiBody({ type: CreateCheckoutPaymentDto })
  @ApiCreatedResponse({ description: 'Sesión de Checkout creada' })
  @ApiBadRequestResponse({ description: 'Error de validación' })
  createCheckoutPayment(@Body() dto: CreateCheckoutPaymentDto) {
    return this.paymentsService.createCheckoutPaymentSession(dto);
  }

  // --- Endpoint para crear sesión de SUSCRIPCIÓN ---
  @Post('checkout/subscription')
  @ApiOperation({ summary: 'Crear sesión de Checkout para suscripción' })
  @ApiBody({ type: CreateCheckoutSubscriptionDto })
  @ApiCreatedResponse({ description: 'Sesión de Checkout creada' })
  @ApiBadRequestResponse({ description: 'Error de validación' })
  createCheckoutSubscription(@Body() dto: CreateCheckoutSubscriptionDto) {
    return this.paymentsService.createCheckoutSubscriptionSession(dto);
  }

  // --- Endpoint para recibir WEBHOOKS de Stripe ---
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Endpoint para Webhooks de Stripe' })
  @ApiHeader({ name: 'stripe-signature', required: true })
  async webhook(@Req() req: express.Request, @Res() res: express.Response) {
    const sigHeader = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      this.logger.error('Stripe webhook secret no está configurado.');
      return res.status(500).send('Webhook secret no configurado');
    }

    if (!sigHeader) {
      return res.status(400).send('Falta la cabecera stripe-signature');
    }

    let event;
    try {
      const stripe = this.paymentsService.getStripe();
      event = stripe.webhooks.constructEvent((req as any).rawBody, sigHeader, secret);
    } catch (e: any) {
      this.logger.warn(`Falló la validación de la firma del webhook de Stripe: ${e.message}`);
      return res.status(400).send(`Webhook Error: ${e.message}`);
    }

    // Pasamos el evento al servicio para que lo procese
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await this.paymentsService.applyCheckoutCompleted(session);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        await this.paymentsService.upsertFromInvoice(invoice);
        break;
      }
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any;
        if (!pi.invoice) {
          await this.paymentsService.syncFromStripe(pi.id);
        }
        break;
      }
    }

    res.send({ received: true });
  }

  // --- Endpoint para OBTENER ESTADO DE SUSCRIPCIÓN ---
  @Get('users/:userId/subscription-status')
  @ApiOperation({ summary: 'Obtiene el estado de la suscripción de un usuario' })
  @ApiParam({ name: 'userId', description: 'El ID del usuario en tu base de datos' })
  @ApiOkResponse({
    description: 'Estado de la suscripción recuperado con éxito.',
    schema: {
      example: {
        status: 'active',
        stripeSubscriptionId: 'sub_...',
        currentPeriodEnd: '2025-10-23T14:30:00.000Z',
        priceId: 'price_...'
      },
    },
  })
  getSubStatus(@Param('userId') userId: string) {
    return this.paymentsService.getSubscriptionStatusForUser(userId);
  }

  // --- Endpoints adicionales (sin cambios) ---

  @Get('checkout/session/:id')
  @ApiOperation({ summary: 'Obtener detalles de una sesión de Checkout' })
  @ApiParam({ name: 'id', description: 'Checkout Session ID (cs_...)' })
  getSession(@Param('id') id: string) {
    return this.paymentsService.getCheckoutSession(id);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Realizar un reembolso total o parcial' })
  @ApiBody({ type: RefundPaymentDto })
  refund(@Body() dto: RefundPaymentDto) {
    return this.paymentsService.refund(dto);
  }
}

