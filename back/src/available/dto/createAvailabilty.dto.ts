import { IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilityDto {
  @ApiProperty({ example: '2025-09-25', description: 'Fecha puntual (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'date es requerido' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date debe ser YYYY-MM-DD' })
  date!: string;

  @ApiProperty({ example: '09:00', description: 'Hora inicio (HH:mm, 24h)' })
  @IsNotEmpty({ message: 'startTime es requerido' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime debe tener formato HH:mm (00:00–23:59)',
  })
  startTime!: string;

  @ApiProperty({ example: '12:00', description: 'Hora fin (HH:mm, 24h)' })
  @IsNotEmpty({ message: 'endTime es requerido' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime debe tener formato HH:mm (00:00–23:59)',
  })
  endTime!: string;
}
