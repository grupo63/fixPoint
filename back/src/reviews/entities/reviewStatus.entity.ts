import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Professional } from 'src/professional/entity/professional.entity';
import { ReservationStatusEnum } from 'src/reservation/enums/reservation-status.enum';

@Entity({ name: 'review_status' })
export class ReviewStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReservationStatusEnum,
    default: ReservationStatusEnum.PENDING,
  })
  status: ReservationStatusEnum;

  @ManyToOne(() => Professional, (professional) => professional)
  professional: Professional;
}
