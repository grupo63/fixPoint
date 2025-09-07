import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum reservationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  reviewId: string;

  // @ManyToOne(() => UserActivation, (User) => User.isActive)
  // @JoinColumn({ name: 'userId' })
  // user: UserActivation;

  // @ManyToOne(() => Professional, (Professional) => Professional.isActive)
  // @JoinColumn({ name: 'professionalId' })
  // professional: Professional;

  @Column({ type: 'int' })
  rate: number;

  @Column({ type: 'varchar', length: 255 })
  commentary: string;

  @CreateDateColumn({ type: 'timestamp' })
  date: Date;
}
