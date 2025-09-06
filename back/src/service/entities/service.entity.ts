import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Professional } from '../../professional/entity/professional.entity';

@Entity({ name: 'service' })
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @ManyToOne(() => Category, (category) => category.services, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;

  // En Professional la propiedad es `service: Service[]`
  @ManyToOne(() => Professional, (prof) => prof.service, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  @Column()
  professionalId: string;
}