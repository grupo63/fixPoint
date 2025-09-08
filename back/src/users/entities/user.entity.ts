import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TemporaryRole } from '../types/temporary-role';
import { Professional } from 'src/professional/entity/professional.entity';

@Entity({
  name: 'USERS',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  //identificar mayoria de edad
  @Column({ type: 'date', nullable: true, default: null })
  birthDate?: Date | null;

  @Column({ type: 'integer', nullable: true, default: null })
  phone?: number | null;

  @Column({ name: 'adress', type: 'varchar', nullable: true, default: null })
  address?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, default: null })
  city?: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, default: null })
  zipCode?: string | null;

  @Column({
    type: 'enum',
    enum: TemporaryRole,
    default: TemporaryRole.USER,
  })
  role: TemporaryRole;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  profileImage?: string | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @OneToOne(() => Professional, (professional) => professional.user)
  professional: Professional;
}
