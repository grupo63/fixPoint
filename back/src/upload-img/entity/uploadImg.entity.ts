import { Exclude } from 'class-transformer';
import { Professional } from 'src/professional/entity/professional.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProfessionalWork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  imgUrl?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description?: string;

  @ManyToOne(() => Professional, (professional) => professional.workImg, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  professional: Professional;
}
