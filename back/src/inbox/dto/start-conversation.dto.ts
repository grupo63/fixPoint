import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class StartConversationDto {
  @ApiProperty({
    description: 'Professional identifier. Accepts users.id or professionals.id (UUID v4)',
    example: 'a2f4a55e-6c49-4a1d-9f62-1f3e2e8f3c23',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUUID('4')
  professionalId: string;

  @ApiPropertyOptional({
    description: 'Optional first message to send',
    example: 'Hi! I’m interested in your service.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  content?: string;
}