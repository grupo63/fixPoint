import { IsUUID, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReservationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateReservationDto {
  @ApiProperty({
    example: 'd888e223-b12d-4874-a69c-2c262804c7c8',
    description: 'The unique ID of the user creating the reservation.',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: '6c89c8a9-4b36-4d22-9a0d-3c22b9b78e3a',
    description: 'The unique ID of the professional being reserved.',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  professionalId: string;

  @ApiProperty({
    example: '2025-12-25T14:30:00Z',
    description: 'The date and time of the reservation in ISO 8601 format.',
  })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    example: ReservationStatus.PENDING,
    description: 'The status of the reservation.',
    enum: ReservationStatus,
  })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
