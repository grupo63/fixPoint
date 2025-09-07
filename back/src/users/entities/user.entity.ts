import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TemporaryRole } from '../types/temporary-role';
import { Professional } from 'src/professional/entity/professional.entity';
import { Review } from 'src/reviews/entities/review.entity';

@Entity({
  name: 'USERS',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //Relacion con review
  @OneToMany(() => Review, (rewiew) => rewiew.user)
  reviews: Review[];

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
    length: 15,
    nullable: false,
  })
  password: string;

  //identificar mayoria de edad
  @Column({
    type: 'date',
  })
  birthDate: Date;

  @Column({
    type: 'int',
  })
  phone: number;

  @Column({
    type: 'varchar',
  })
  adress: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  zipCode: string;

  @Column({
    type: 'enum',
    enum: TemporaryRole,
    default: TemporaryRole.USER,
  })
  role: TemporaryRole;

  @Column({
    type: 'varchar',
    length: 255,
  })
  profileImage: string;

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
