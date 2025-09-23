import { IsEmail, IsString } from 'class-validator';

export class ReservationNotificationDto {
  @IsEmail()
  userEmail: string;

  // @IsEmail()
  // professionalEmail: string;

  @IsString()
  userName: string;

  @IsString()
  professionalName: string;

  @IsString()
  date: string;

  @IsString()
  hourStart: string;

  @IsString()
  hourEnd: string;
}
