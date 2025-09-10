import {
  IsBoolean,
  IsNumber,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  @Length(1, 50)
  startTime: string;

  @IsString()
  @Length(1, 50)
  endTime: string;

  @IsBoolean()
  isRecurring: boolean;

  @IsUUID()
  professionalId: string;
}
