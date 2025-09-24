import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Subscription } from 'src/subscription/entities/subscription.entity'; // 👈 usa SIEMPRE el mismo import

export enum PaymentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK escalar
  @Column({
    name: 'stripeSubscriptionId', // Nombre de la columna en la BD
    type: 'varchar',
    nullable: true,
  })
  stripeSubscriptionId: string;

  // Relación real que espera tu Subscription
  @ManyToOne(() => Subscription, (s) => s.payments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  subscription: Subscription;

  @Column({ type: 'int', default: 0 })
  amount!: number;

  @Column({ type: 'varchar', default: 'usd' })
  currency!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  providerPaymentId?: string; // pi_...

  @Index()
  @Column({ type: 'varchar', nullable: true })
  providerInvoiceId?: string; // in_...

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  providerCheckoutSessionId?: string; // cs_...

  @Column({ type: 'varchar', nullable: true })
  checkoutMode?: 'payment' | 'subscription';

  @Column({ type: 'int', default: 0 })
  refundedAmount!: number;

  @Column({ type: 'varchar' })
  status!: PaymentStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
  
}
