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
import { UserStatus } from '../types/userStatus';

@Entity({
  name: 'USERS',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //Relacion con review
  // @OneToMany(() => Review, (rewiew) => rewiew.user)
  // reviews: Review[];

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
    length: 100,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  birthDate?: Date;

  @Column({
    type: 'int',
    nullable: true,
  })
  phone?: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  address?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  city?: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  zipCode?: string;

  @Column({
    type: 'enum',
    enum: TemporaryRole,
    default: TemporaryRole.USER,
  })
  role: TemporaryRole;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  profileImage?: string | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  active: UserStatus;

  @OneToOne(() => Professional, (professional) => professional.user)
  professional: Professional;
}
