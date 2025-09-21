import { Professional } from 'src/professional/entity/professional.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  reservationId: string;

  // ---- USER (cliente que crea la reserva)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })         // <- FK explícita
  user: User;

  @Column({ type: 'uuid', nullable: false })
  userId: string;                          // <- nueva columna

  // ---- PROFESSIONAL
  @ManyToOne(() => Professional, (p) => p.reservations, { eager: true })
  @JoinColumn({ name: 'professionalId' })  // <- enlaza a tu columna existente
  professional: Professional;

  @Column({ type: 'uuid', nullable: false })
  professionalId: string;                  // <- ya la tenías

  @Column({
    type: 'enum',
    enum: ReservationStatusEnum,
    default: ReservationStatusEnum.PENDING,
  })
  status: ReservationStatusEnum;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @Column({ type: 'timestamp', nullable: true }) // opcional que sea nullable
  endDate: Date | null;

  @Column({ default: false })
  wasReviewed: boolean;
}
