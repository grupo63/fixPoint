import { Professional } from 'src/professional/entity/professional.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  reservationId: string;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  user: User;

  @ManyToOne(() => Professional, (Professional) => Professional.id, {
    eager: true,
  })
  professional: Professional;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  })
  status: string;
}
