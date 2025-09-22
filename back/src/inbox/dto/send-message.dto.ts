import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, Length } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Conversation UUID', example: '2dbb2c6c-1fda-4e89-9b55-3e9c6a72a1b0' })
  @IsUUID('4')
  conversationId: string;

  @ApiProperty({
    description: 'Message content (1–2000 chars)',
    example: 'Hi! Do you have availability tomorrow morning?',
  })
  @IsString()
  @Length(1, 2000)
  content: string;
}