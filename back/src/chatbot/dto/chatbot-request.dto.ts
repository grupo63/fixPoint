import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageDto } from './message.dto';

export class ChatbotRequestDto {
  @ApiProperty({
    description: 'Ordered message history to provide context to the chatbot.',
    type: [MessageDto],
    minItems: 1,
  })
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  @ArrayMinSize(1)
  messages: MessageDto[];

  @ApiPropertyOptional({
    description: 'Optional conversation identifier if you store history on your side.',
    example: 'b9e0a7d2-1cbb-4e1e-bb4c-8f5a2b1f64a2',
  })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'If true, client expects streaming (SSE). Ignored by POST /chatbot.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  stream?: boolean;
}