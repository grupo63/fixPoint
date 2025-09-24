export class PaymentEmailPayload {
  email: string; // Correo del usuario
  name: string; // Nombre del usuario
  amount: number; // Monto del pago
  date: string; // Fecha del pago
  transactionId: string; // ID de la transacción (providerPaymentId)
  method: string; // Método de pago (puedes inferirlo)
}
