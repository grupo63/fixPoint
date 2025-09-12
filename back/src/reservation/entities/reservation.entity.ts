import { Professional } from 'src/professional/entity/professional.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  reservationId: string;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  user: User;

  @ManyToOne(() => Professional, (Professional) => Professional.reservation, {
    eager: true,
  })
  professional: Professional;

  @Column({
    type: 'enum',
    enum: ReservationStatusEnum,
    default: ReservationStatusEnum.PENDING,
  })
  status: ReservationStatusEnum;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @Column({ default: false })
  wasReviewed: boolean;
}
