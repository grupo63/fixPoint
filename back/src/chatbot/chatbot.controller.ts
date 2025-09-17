import {
  Body, Controller, Post, Sse, Req, Res,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatbotRequestDto } from './dto/chatbot-request.dto';
import type { Request, Response } from 'express';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Post()
  @ApiOperation({
    summary: 'Chat (single reply, no streaming)',
    description:
      'Returns one complete reply. First tries a fuzzy match against built-in FAQs; if no match, falls back to a mock LLM response.',
  })
  @ApiBody({
    type: ChatbotRequestDto,
    description: 'Ordered chat history used to generate the reply.',
    examples: {
      faqMatch: {
        summary: 'FAQ path (precached answer)',
        value: {
          messages: [
            { role: 'system', content: 'You are the FixPoint assistant.' },
            { role: 'user', content: 'What categories are available?' },
          ],
        },
      },
      llmFallback: {
        summary: 'LLM fallback (no FAQ match)',
        value: {
          messages: [
            { role: 'system', content: 'You are the FixPoint assistant.' },
            { role: 'user', content: 'Give me 3 safety tips before hiring.' },
          ],
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'OK. Returns the reply and the source used to generate it.',
    schema: { example: { reply: 'Plumbing, Locksmith, Electricity, Carpentry, Painting.', source: 'faq' } },
  })
  async chat(@Body() body: ChatbotRequestDto) {
    const { reply, source } = await this.chatbot.answer(body.messages);
    return { reply, source };
  }

  @Sse('stream')
  @ApiOperation({
    summary: 'Chat (streamed reply via SSE)',
    description:
      'Streams text chunks using Server-Sent Events. Each frame is `data: {"chunk":"..."}`. Ends with `event: source` (faq|llm) and `event: done`.',
  })
  @ApiProduces('text/event-stream')
  @ApiBody({
    type: ChatbotRequestDto,
    description: 'Ordered chat history used to stream a reply.',
    examples: {
      streaming: {
        summary: 'Streaming example',
        value: {
          messages: [
            { role: 'system', content: 'You are the FixPoint assistant.' },
            { role: 'user', content: 'How do I register as a professional?' },
          ],
        },
      },
    },
  })
  async chatStream(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const body = req.body as ChatbotRequestDto;
    if (!body?.messages?.length) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'messages required' })}\n\n`);
      return res.end();
    }

    try {
      const meta = await this.chatbot.answerStream(body.messages, (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      });
      res.write(`event: source\ndata: ${JSON.stringify(meta)}\n\n`);
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
    } catch (e) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: (e as Error).message })}\n\n`);
      res.end();
    }
  }
}