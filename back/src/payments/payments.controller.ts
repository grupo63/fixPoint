import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSubscriptionDto } from './dto/create-payment.dto';
import * as express from 'express';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { TemporaryRole } from 'src/users/types/temporary-role';
import { Roles } from 'src/admin/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout/subscription')
  @ApiOperation({ summary: 'Crear sesión de Checkout para suscripción' })
  createCheckoutSubscription(@Body() dto: CreateCheckoutSubscriptionDto) {
    return this.paymentsService.createCheckoutSubscriptionSession(dto);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Endpoint para Webhooks de Stripe' })
  @ApiHeader({ name: 'stripe-signature', required: true })
  async webhook(@Req() req: express.Request, @Res() res: express.Response) {
    const sigHeader = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !sigHeader) return res.status(400).send('Faltan datos de webhook');

    let event;
    try {
      event = this.paymentsService.getStripe().webhooks.constructEvent((req as any).rawBody, sigHeader, secret);
    } catch (e: any) {
      this.logger.warn(`Falló la validación del webhook de Stripe: ${e.message}`);
      return res.status(400).send(`Webhook Error: ${e.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await this.paymentsService.applyCheckoutCompleted(session);
        break;
      }
      case 'invoice.created': {
        const invoice = event.data.object as any;
        await this.paymentsService.createPaymentFromInvoice(invoice);
        break;
      }
      // Podríamos necesitar otros eventos como 'invoice.payment_succeeded' pero por ahora lo dejamos simple.
    }
    res.send({ received: true });
  }

  @Get('users/:userId/subscription-status')
  @ApiOperation({ summary: 'Obtiene el estado de la suscripción de un usuario' })
  getSubStatus(@Param('userId') userId: string) {
    return this.paymentsService.getSubscriptionStatusForUser(userId);
  }

  @Post('subscriptions/cancel')
  @ApiOperation({ summary: 'Cancela la suscripción de un usuario' })
  async cancelSubscription(@Body('userId') userId: string) {
    return this.paymentsService.cancelSubscription(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TemporaryRole.ADMIN)
  @Get('stats')
  @ApiOperation({ summary: 'Global statistics for payments and subscriptions' })
  getStats() {
    return this.paymentsService.getGlobalStats();
  }
}
