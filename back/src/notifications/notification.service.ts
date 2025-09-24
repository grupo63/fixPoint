import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ReservationNotificationDto } from './dto/reservation-notification.dto';
// import { PaymentEmailPayload } from './dto/PaymentEmailPyaload.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  async sendTestEmail() {
    const info = await this.transporter.sendMail({
      from: `"Test App" <${process.env.EMAIL_USER}>`,
      to: 'laonrderneas11@gmail.com', // 👈 cámbialo al correo donde quieras recibir la prueba
      subject: '"Correo de prueba"',
      text: 'Este es un correo de prueba desde Nodemailer + NestJS 🚀',
    });

    this.logger.debug(`Mensaje enviado: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log('Nodemailer listo para enviar.');
    } catch (err: any) {
      this.logger.error(
        'Fallo al verificar transporter',
        err?.response || err?.message || err,
      );
    }
  }

  private getMessageId(): string {
    const domain =
      process.env.NOTIFICATIONS_EMAIL?.split('@')[1] || 'miapp.com';
    return `<${uuidv4()}@${domain}>`;
  }

  async sendReservationNotification(
    dto: ReservationNotificationDto,
  ): Promise<void> {
    try {
      const userMessage = `Hola ${dto.userName}, tu reserva con ${dto.professionalName} ha sido confirmada para el ${dto.date} de ${dto.hourStart} a ${dto.hourEnd}.`;

      const mailOptions = {
        from: `"Sistema de Reservas" <${process.env.NOTIFICATIONS_EMAIL}>`,
        to: dto.userEmail,
        subject: 'Confirmación de tu reserva',
        text: userMessage,
        messageId: this.getMessageId(),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.debug(`Email de reserva enviado a ${dto.userEmail}`);
    } catch (error: any) {
      this.logger.error(
        'Fallo enviando email de reserva',
        error?.message || error,
      );
      throw new InternalServerErrorException(
        'Error al enviar el correo de reserva',
      );
    }
  }

  async sendWelcomeEmail(user: { name: string; email: string }) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.NOTIFICATIONS_EMAIL}>`,
        to: user.email,
        subject: `¡Bienvenido a ${process.env.APP_NAME}!`,
        html: `
          <h2>Hola ${user.name || 'Usuario'},</h2>
          <p>Tu cuenta ha sido creada exitosamente. ¡Nos alegra tenerte con nosotros!</p>
          <p>Si tienes dudas, puedes escribirnos a ${process.env.SUPPORT_EMAIL}</p>
          <br>
          <strong>El equipo de ${process.env.APP_NAME}</strong>
        `,
        messageId: this.getMessageId(),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.debug(`Correo de bienvenida enviado a ${user.email}`);
    } catch (error: any) {
      this.logger.error(
        'Error al enviar correo de bienvenida',
        error?.message || error,
      );
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de bienvenida',
      );
    }
  }

  // async sendPaymentConfirmationEmail(data: PaymentEmailPayload) {
  //   try {
  //     const mailOptions = {
  //       from: `"${process.env.APP_NAME}" <${process.env.NOTIFICATIONS_EMAIL}>`,
  //       to: data.email,
  //       subject: `Confirmación de pago - ${process.env.APP_NAME}`,
  //       html: `
  //         <h2>Hola ${data.name || 'Usuario'},</h2>
  //         <p>Hemos recibido tu pago de <strong>$${data.amount}</strong> realizado el <strong>${data.date}</strong>.</p>
  //         <p>Detalles de la transacción:</p>
  //         <ul>
  //           <li>ID de transacción: ${data.transactionId}</li>
  //           <li>Método de pago: ${data.method}</li>
  //         </ul>
  //         <p>Gracias por tu confianza. Si tienes dudas, contáctanos en ${process.env.SUPPORT_EMAIL}</p>
  //         <br>
  //         <strong>El equipo de ${process.env.APP_NAME}</strong>
  //       `,
  //     };

  //     const info = await this.transporter.sendMail(mailOptions);
  //     this.logger.debug(
  //       `Correo de confirmación de pago enviado a ${data.email}, messageId: ${info.messageId}`,
  //     );
  //   } catch (error: any) {
  //     this.logger.error(
  //       'Error al enviar correo de pago',
  //       error?.message || error,
  //     );
  //     throw new InternalServerErrorException(
  //       'No se pudo enviar el correo de pago',
  //     );
  //   }
  // }
}
