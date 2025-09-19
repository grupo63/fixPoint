import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { AskDto } from './dto/ask.dto';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly svc: ChatbotService) {}

  @Get('faq')
  @ApiOperation({ summary: 'Retrieve predefined FAQs' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es','en'], description: 'Optional language filter' })
  @ApiOkResponse({ description: 'Array of FAQ items (filtered by lang if provided)' })
  faq(@Query('lang') lang?: 'es' | 'en') {
    return this.svc.list(lang);
  }

  @Post('ask')
  @ApiOperation({ summary: 'Ask the FAQ chatbot (preloaded)' })
  @ApiBody({
    type: AskDto,
    examples: {
      es: { value: { message: '¿Cómo contrato un plomero cerca de mí?', lang: 'es' } },
      en: { value: { message: 'How do I register as a professional?', lang: 'en' } },
    },
  })
  @ApiOkResponse({
    description: 'Chatbot response with best-matched FAQ, language and related suggestions',
  })
  ask(@Body() dto: AskDto) {
    return this.svc.ask(dto.message, dto.lang ?? 'auto');
  }
}