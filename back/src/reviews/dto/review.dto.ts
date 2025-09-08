import { ApiProperty } from '@nestjs/swagger';

export class ReviewDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique ID of the review.',
    type: 'string',
    format: 'uuid',
  })
  reviewId: string;

  @ApiProperty({
    example: 'd888e223-b12d-4874-a69c-2c262804c7c8',
    description: 'The unique ID of the reservation associated with the review.',
    type: 'string',
    format: 'uuid',
  })
  reservationId: string;

  @ApiProperty({
    example: '6c89c8a9-4b36-4d22-9a0d-3c22b9b78e3a',
    description: 'The unique ID of the user who wrote the review.',
    type: 'string',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    example: 5,
    description: 'The rating of the review, on a scale of 1 to 5.',
    type: 'integer',
    minimum: 1,
    maximum: 5,
  })
  rate: number;

  @ApiProperty({
    example: 'Excelente servicio, muy profesional y atento.',
    description: 'A commentary or detailed description of the review.',
    type: 'string',
  })
  commentary: string;

  @ApiProperty({
    example: '2025-09-07T14:30:00Z',
    description: 'The date when the review was created.',
    type: 'string',
    format: 'date-time',
  })
  date: Date;
}
