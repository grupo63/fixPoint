import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export const ChatRoles = ['system', 'user', 'assistant'] as const;
export type ChatRole = (typeof ChatRoles)[number];

export class MessageDto {
  @ApiProperty({
    description: 'Message role in the chat turn.',
    enum: ChatRoles,
    example: 'user',
  })
  @IsIn(ChatRoles)
  role: ChatRole;

  @ApiProperty({
    description: 'Message content in plain text.',
    example: 'How do I register as a professional?',
  })
  @IsString()
  content: string;
}