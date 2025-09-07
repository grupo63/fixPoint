import { IsInt, IsNotEmpty, IsUUID, Max, Min, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  review_ID: string;

  @IsUUID()
  @IsNotEmpty()
  reservationId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rate: number;

  @IsString()
  @IsNotEmpty()
  commentary: string;
}
