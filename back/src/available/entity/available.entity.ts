import { Professional } from 'src/professional/entity/professional.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('available')
// ✅ La clave única debe usar la FK, no la relación:
@Unique('UQ_available_prof_date_start_end', ['professionalId', 'date', 'startTime', 'endTime'])
export class Available {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK explícita a Professional
  @Column({ type: 'uuid' })
  professionalId: string;

  @ManyToOne(() => Professional, (professional) => professional.available, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'professionalId' })
  professional: Professional;

  // Fecha puntual (YYYY-MM-DD)
  @Column({ type: 'date' })
  date: string;

  // Rango horario (usar 'time' en Postgres para orden/comparación correctos)
  @Column({ type: 'time' })
  startTime: string; // HH:mm:ss (PG guarda segundos; podés enviar HH:mm y PG lo completa)

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'varchar', length: 20, default: 'Available' })
  status: 'Available' | 'Not Available';
}
