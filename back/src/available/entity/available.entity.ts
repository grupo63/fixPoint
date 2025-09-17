import { Professional } from 'src/professional/entity/professional.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('available')
export class Available {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'int',
  })
  dayOfWeek: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  startTime: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  endTime: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 20, default: 'Available' })
  status: 'Available' | 'Not Available';

  @ManyToOne(() => Professional, (professional) => professional.available)
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;
}
