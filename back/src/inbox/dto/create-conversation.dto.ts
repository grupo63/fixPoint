import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateConversationDto {
  @ApiProperty({ description: 'Client UUID (users.id)', example: '9e8a7c67-1b0b-4f7a-ae0b-2b5f97af2b9a' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsUUID('4', { message: 'clientId must be a UUID v4 (users.id)' })
  clientId: string;

  @ApiProperty({ description: 'Professional UUID (users.id)', example: 'a2f4a55e-6c49-4a1d-9f62-1f3e2e8f3c23' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsUUID('4', { message: 'professionalId must be a UUID v4 (users.id)' })
  professionalId: string;
}