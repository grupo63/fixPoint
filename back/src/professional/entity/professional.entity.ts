import { Available } from 'src/available/entity/available.entity';
import {} from 'src/reservation/dto/create-reservation.dto';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Service } from 'src/service/entities/service.entity';
import { ProfessionalWork } from 'src/upload-img/entity/uploadImg.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'professional',
})
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  speciality?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  aboutMe?: string;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
    nullable: true,
  })
  longitud?: number;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
    nullable: true,
  })
  latitude?: number;

  @Column({
    type: 'int',
    default: 10,
  })
  workingRadius: number;

  @Index()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  location?: string;

  @Column({
    type: 'varchar',
    length: 255,
    default:
      'https://tumayorferretero.net/22457-large_default/producto-generico.jpg',
    nullable: true,
  })
  profileImg?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @OneToOne(() => User)
  @JoinColumn({
    name: 'userId',
  })
  user: User;

  @OneToMany(() => ProfessionalWork, (workImage) => workImage.professional)
  workImg: ProfessionalWork[];

  @OneToMany(() => Available, (available) => available.professional)
  available: Available[];

  @OneToMany(() => Service, (service) => service.professional)
  service: Service[];

  // Relacion con entity review
  @OneToMany(() => Review, (rewiew) => rewiew.professional)
  reviews: Review[];

  @OneToMany(() => Reservation, (reservation) => reservation.professional)
  reservations: Reservation[];
}
