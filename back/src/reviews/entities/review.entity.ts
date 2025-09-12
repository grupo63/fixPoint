import { Professional } from 'src/professional/entity/professional.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  reviewId: string;

  @ManyToOne(() => User, (user) => user.reviews, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Professional, (Professional) => Professional.reviews)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  @Column({ type: 'int' })
  rate: number;

  @Column({ type: 'varchar', length: 255 })
  commentary: string;

  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  @ManyToOne(() => Reservation, { nullable: false })
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;
}
