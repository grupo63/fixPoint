import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InboxService } from './inbox.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards'; // ajusta si tu guard vive en otra ruta
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import { StartConversationDto } from './dto/start-conversation.dto';

@ApiTags('Inbox')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inbox')
export class InboxController {
  constructor(private readonly svc: InboxService) {}

  // --- Simplified start endpoint ---
  @Post('start')
  @ApiOperation({ summary: 'Start a conversation with a professional (one-call, simplified)' })
  @ApiOkResponse({
    description: 'Conversation created or already existing',
    schema: {
      example: {
        id: '2dbb2c6c-1fda-4e89-9b55-3e9c6a72a1b0',
        clientId: '9e8a7c67-1b0b-4f7a-ae0b-2b5f97af2b9a',
        professionalId: 'a2f4a55e-6c49-4a1d-9f62-1f3e2e8f3c23',
        status: 'active',
        createdAt: '2025-09-21T17:10:00.000Z',
        updatedAt: '2025-09-21T17:10:00.000Z',
      },
    },
  })
  async start(@Body() dto: StartConversationDto, @Req() req: any) {
    return this.svc.start(dto, req.user.id);
  }

  // --- Classic endpoints (keep them for flexibility / Thunder tests) ---
  @Post('conversations')
  @ApiOperation({ summary: 'Create or reuse a client–professional conversation' })
  @ApiOkResponse({
    description: 'Conversation created or already existing',
    schema: {
      example: {
        id: '2dbb2c6c-1fda-4e89-9b55-3e9c6a72a1b0',
        clientId: '9e8a7c67-1b0b-4f7a-ae0b-2b5f97af2b9a',
        professionalId: 'a2f4a55e-6c49-4a1d-9f62-1f3e2e8f3c23',
        status: 'active',
        createdAt: '2025-09-21T17:10:00.000Z',
        updatedAt: '2025-09-21T17:10:00.000Z',
      },
    },
  })
  async upsertConversation(@Body() dto: CreateConversationDto, @Req() req: any) {
    return this.svc.upsertConversation(dto, req.user.id);
  }

  @Get('conversations/mine')
  @ApiOperation({ summary: 'List my conversations (client or professional)' })
  @ApiOkResponse({
    description: 'Array of the user’s conversations',
    schema: {
      example: [
        {
          id: '2dbb2c6c-1fda-4e89-9b55-3e9c6a72a1b0',
          clientId: '9e8a7c67-1b0b-4f7a-ae0b-2b5f97af2b9a',
          professionalId: 'a2f4a55e-6c49-4a1d-9f62-1f3e2e8f3c23',
          status: 'active',
          createdAt: '2025-09-21T17:10:00.000Z',
          updatedAt: '2025-09-21T17:15:00.000Z',
        },
      ],
    },
  })
  async myConversations(@Req() req: any) {
    return this.svc.listMyConversations(req.user.id);
  }

  @Get('messages/:conversationId')
  @ApiOperation({ summary: 'List messages of a conversation (paginated)' })
  @ApiOkResponse({
    description: 'Pagination metadata and message items',
    schema: {
      example: {
        total: 2,
        limit: 20,
        offset: 0,
        items: [
          {
            id: '7a6f9a6e-2c3d-4d0c-8b61-2e4a26e9e0a1',
            conversationId: '2dbb2c6c-1fda-4e89-9b55-3e9c6a72a1b0',
            senderId: '9e8a7c67-1b0b-4f7a-ae0b-2b5f97af2b9a',
            content: 'Hi! Do you have availability this Friday?',
            readAt: null,
            createdAt: '2025-09-21T17:12:00.000Z',
          },
          {
            id: '5c4f7a8e-6b9a-4c3d-9e1b-4f0a2b7c6d8e',
            conversationId: '2dbb2c6c-1fda-4e89-9b55-3e9c6a72a1b0',
            senderId: 'a2f4a55e-6c49-4a1d-9f62-1f3e2e8f3c23',
            content: 'Yes—3:00 p.m. works for me.',
            readAt: '2025-09-21T17:13:10.000Z',
            createdAt: '2025-09-21T17:13:00.000Z',
          },
        ],
      },
    },
  })
  async listMessages(
    @Param('conversationId') conversationId: string,
    @Query() q: ListMessagesDto,
    @Req() req: any,
  ) {
    return this.svc.listMessages(conversationId, req.user.id, q.limit, q.offset);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send message' })
  @ApiOkResponse({
    description: 'Message created',
    schema: {
      example: {
        id: '7a6f9a6e-2c3d-4d0c-8b61-2e4a26e9e0a1',
        conversationId: '2dbb2c6c-1fda-4e89-9b55-3e9c6a72a1b0',
        senderId: '9e8a7c67-1b0b-4f7a-ae0b-2b5f97af2b9a',
        content: "Great—I'll confirm the address shortly.",
        readAt: null,
        createdAt: '2025-09-21T17:14:00.000Z',
      },
    },
  })
  async sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
    return this.svc.sendMessage(dto, req.user.id);
  }

  @Patch('messages/:id/read')
  @ApiOperation({ summary: 'Mark a message as read (MVP)' })
  async markRead(@Param('id') id: string, @Req() req: any) {
    return this.svc.markRead(id, req.user.id);
  }
}