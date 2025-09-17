import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { LLMFactory } from './providers/llm.factory';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, LLMFactory],
  exports: [ChatbotService],
})
export class ChatbotModule {}