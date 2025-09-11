import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Professional } from 'src/professional/entity/professional.entity';

export enum ReservationStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

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
