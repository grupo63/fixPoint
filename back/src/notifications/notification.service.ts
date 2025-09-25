import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { ReservationNotificationDto } from './dto/reservation-notification.dto';
import { PaymentEmailPayload } from './dto/paymentEmail.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isReady = false; // Estado de salud del servicio
  private readonly emailEnabled =
    String(process.env.EMAIL_ENABLED ?? 'true').toLowerCase() === 'true';

  private buildTransport() {
    const host = process.env.SMTP_HOST ?? 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT ?? '465');
    const secure =
      String(process.env.SMTP_SECURE ?? 'true').toLowerCase() === 'true';

    this.logger.log(
      `SMTP config -> host=${host} port=${port} secure=${secure} user=${process.env.EMAIL_USER} enabled=${this.emailEnabled}`,
    );

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 3,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      ...(port === 587 && !secure ? { requireTLS: true } : {}),
    });
  }

  constructor() {
    this.transporter = this.buildTransport();
  }

  async onModuleInit() {
    if (!this.emailEnabled) {
      this.logger.warn('EMAIL_ENABLED=false → los emails no se enviarán.');
      return;
    }
    this.verifyTransporterInBackground();
  }
  
  private async verifyTransporterInBackground() {
      try {
        await this.transporter?.verify();
        this.logger.log('SMTP verificado: listo para enviar.');
        this.isReady = true;
      } catch (err: any) {
        this.logger.error(
          'Fallo al verificar transporter. El servicio de correo permanecerá deshabilitado.',
          err?.message || String(err),
        );
      }
  }

  private getMessageId(): string {
    const domain =
      process.env.NOTIFICATIONS_EMAIL?.split('@')[1] || 'miapp.com';
    return `<${uuidv4()}@${domain}>`;
  }

  private async safeSend(options: nodemailer.SendMailOptions, tag: string) {
    if (!this.emailEnabled) {
      this.logger.warn(`[email-disabled] ${tag} -> NO enviado`, options);
      return { messageId: 'disabled' };
    }
    
    if (!this.isReady) {
      this.logger.warn(`[email-not-ready] ${tag} -> NO enviado porque el transporter no está verificado.`);
      return { messageId: 'not-ready' };
    }

    const fromAddress = process.env.NOTIFICATIONS_EMAIL || process.env.EMAIL_USER;
    const finalOptions = {
      ...options,
      from: options.from ?? `"${process.env.APP_NAME || 'App'}" <${fromAddress}>`,
      messageId: this.getMessageId(),
    };

    const info = await this.transporter!.sendMail(finalOptions);
    this.logger.debug(`[email] ${tag} -> enviado ok: ${info.messageId}`);
    return info;
  }

  // --- MÉTODOS ORIGINALES RESTAURADOS ---

  async sendTestEmail() {
    const to = process.env.EMAIL_USER;
    return this.safeSend(
      {
        to,
        subject: 'Correo de prueba',
        text: 'Este es un correo de prueba desde Nodemailer + NestJS 🚀',
      },
      'test',
    );
  }

  async sendReservationNotification(dto: ReservationNotificationDto): Promise<void> {
    try {
      const userMessage = `Hola ${dto.userName}, tu reserva con ${dto.professionalName} ha sido confirmada para el ${dto.date} de ${dto.hourStart} a ${dto.hourEnd}.`;

      await this.safeSend(
        {
          to: dto.userEmail,
          subject: 'Confirmación de tu reserva',
          text: userMessage,
        },
        'reservation',
      );
    } catch (error: any) {
      this.logger.error('Fallo enviando email de reserva', error?.message || error);
    }
  }

  async sendWelcomeEmail(user: { name: string; email: string }) {
    try {
      await this.safeSend(
        {
          to: user.email,
          subject: `¡Bienvenido a ${process.env.APP_NAME || 'la app'}!`,
          html: `
            <h2>Hola ${user.name || 'Usuario'},</h2>
            <p>Tu cuenta ha sido creada exitosamente. ¡Nos alegra tenerte con nosotros!</p>
            <p>Si tienes dudas, puedes escribirnos a ${process.env.SUPPORT_EMAIL || ''}</p>
            <br>
            <strong>El equipo de ${process.env.APP_NAME || 'la app'}</strong>
          `,
        },
        'welcome',
      );
    } catch (error: any) {
      this.logger.error('Error al enviar correo de bienvenida', error?.message || error);
    }
  }

  async sendPaymentConfirmationEmail(data: PaymentEmailPayload) {
    try {
      await this.safeSend(
        {
          to: data.email,
          subject: `Confirmación de pago - ${process.env.APP_NAME || 'la app'}`,
          html: `
            <h2>Hola ${data.name || 'Usuario'},</h2>
            <p>Hemos recibido tu pago de 5 USD.</p>
            <p>Detalles de la transacción:</p>
            <ul>
              <li>Método de pago: ${data.method}</li>
            </ul>
            <p>Gracias por tu confianza. Si tienes dudas, contáctanos en ${process.env.SUPPORT_EMAIL || ''}</p>
            <br>
            <strong>El equipo de ${process.env.APP_NAME || 'la app'}</strong>
          `,
        },
        'payment',
      );
    } catch (error: any) {
      this.logger.error('Error al enviar correo de pago', error?.message || error);
    }
  }
}