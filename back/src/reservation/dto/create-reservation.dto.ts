import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    format: 'uuid',
    example: 'd888e223-b12d-4874-a69c-2c262804c7c8',
    description: 'UUID del usuario (cliente) que crea la reserva.',
  })
  @IsUUID()
  userId!: string;

  @ApiProperty({
    format: 'uuid',
    example: '6c89c8a9-4b36-4d22-9a0d-3c22b9b78e3a',
    description: 'UUID del profesional al que se le hace la reserva.',
  })
  @IsUUID()
  professionalId!: string;

  @ApiProperty({
    example: '2025-12-25T14:30:00.000Z',
    description: 'Fecha y hora de la reserva en ISO 8601.',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    description: 'UUID del servicio (opcional, si aplica).',
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;
}
