import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Professional } from 'src/professional/entity/professional.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { TemporaryRole } from '../types/temporary-role';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  // [CHANGE] permitir cuentas OAuth sin password y no seleccionarlo por defecto
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password: string | null;

  // [CHANGE] proveedor de autenticación
  @Column({ type: 'varchar', length: 20, default: 'local' })
  provider: 'local' | 'google' | 'github';

  // [CHANGE] id del proveedor externo (opcional y único)
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  providerId: string | null;

  // [CHANGE] rol básico (arregla foundUser.role)
  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: 'user' | 'professional' | 'admin';

  @Column({ type: 'varchar', length: 60, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  lastName?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  zipCode?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage?: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToOne(() => Professional, (professional) => professional.user)
  professional?: Professional;

  //conecction of reviews and user
  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
