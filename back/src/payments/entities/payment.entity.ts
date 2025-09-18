// back/src/payments/entities/payment.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { PaymentStatus } from '../types/enums';
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Subscription, (s) => s.payments, {
    nullable: true,            // poné false si SIEMPRE hay suscripción
    onDelete: 'SET NULL',      // evita borrados en cascada de pagos históricos
  })
  @JoinColumn({
    name: 'subscriptionId',    // nombre de la FK en esta tabla
    referencedColumnName: 'id' // PK real de Subscription (según tu entidad)
  })
  subscription?: Subscription;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  subscriptionId?: string;

  @Column({ type: 'int' })
  amount: number;              // centavos: 1999 = $19.99

  @Column({ type: 'varchar', length: 10 })
  currency: string;            // 'ars', 'usd', ...

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  providerPaymentId: string;   // pi_...

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  providerInvoiceId?: string;  // in_... (suscripciones)

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  refundedAmount!: number;
}
