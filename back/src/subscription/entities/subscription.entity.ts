import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Entity({ name: 'subscription' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'varchar', length: 5, default: 'AR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @CreateDateColumn({ type: 'time without time zone' })
  createdAt: Date;

  //Relacion con User
  @ManyToOne(() => User, (user) => user.subscription, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.subscription, {
    cascade: true,
  })
  payments: Payment[];
}
