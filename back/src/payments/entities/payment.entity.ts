import { Subscription } from 'src/subscription/entities/subscription.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  MERCADO_PAGO = 'mercado_pago',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 10, nullable: false })
  amount: number;

  @Column({ type: 'varchar', length: 5, default: 'AR' })
  currency: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  providerPaymentId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: false,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    nullable: false,
  })
  status: PaymentStatus;

  @ManyToOne(() => Subscription, (subscription) => subscription.payments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'subscription' })
  subscription: Subscription;
}
