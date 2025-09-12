import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';

export class CreateReservationDto {
  @ApiProperty({
    example: 'd888e223-b12d-4874-a69c-2c262804c7c8',
    description: 'The unique ID of the user creating the reservation.',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: '6c89c8a9-4b36-4d22-9a0d-3c22b9b78e3a',
    description: 'The unique ID of the professional being reserved.',
  })
  @IsUUID()
  @IsNotEmpty()
  professionalId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    description: 'ID del servicio que se desea reservar',
  })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    example: '2025-12-25T14:30:00Z',
    description: 'The date and time of the reservation in ISO 8601 format.',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    enum: ReservationStatusEnum,
    default: ReservationStatusEnum.PENDING,
    description: 'Reservation status. Default to PENDING.',
  })
  @IsEnum(ReservationStatusEnum)
  @IsOptional()
  status?: ReservationStatusEnum = ReservationStatusEnum.PENDING;
}
