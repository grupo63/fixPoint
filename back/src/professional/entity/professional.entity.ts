import { Available } from 'src/available/entity/available.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
// import { reservationStatus, Review } from 'src/reviews/entities/review.entity';
import { Service } from 'src/service/entities/service.entity';
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

  //Relacion con review
  // @OneToMany(() => Review, (rewiew) => rewiew.user)
  // reviews: Review[];

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
  })
  profileImg: string;

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

  // @OneToMany(() => ProfessionalImg, (profImage) => ProfessionalImg.professional)
  // professionalImg: ProfessionalImg[]; //recordar explicitar esta relacion en la tabla de profImage

  // @OneToMany(() => Reservation, (reservation) => reservation.professional)
  // reservation: Reservation[];

  // @OneToMany(() => Available, (available) => available.professional)
  // available: Available[];

  @OneToMany(() => Service, (service) => service.professional)
  service: Service[];

  // @OneToMany(() => reservationStatus, (reservation) => reservation.professional)
  // reservations: Reservation[];
}
