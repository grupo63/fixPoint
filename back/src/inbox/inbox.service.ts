import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { StartConversationDto } from './dto/start-conversation.dto';
import { Professional } from 'src/professional/entity/professional.entity';

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
    @InjectRepository(Professional)
    private readonly proRepo: Repository<Professional>,
  ) {}

  async upsertConversation(dto: CreateConversationDto, requesterId: string) {
    if (![dto.clientId, dto.professionalId].includes(requesterId)) {
      throw new ForbiddenException('Requester must belong to the conversation');
    }

    let conv = await this.convRepo.findOne({
      where: { clientId: dto.clientId, professionalId: dto.professionalId },
    });

    if (!conv) {
      conv = this.convRepo.create({
        clientId: dto.clientId,
        professionalId: dto.professionalId,
        status: 'active',
      });
      conv = await this.convRepo.save(conv);
    }

    return conv;
  }

  async listMyConversations(userId: string) {
    return this.convRepo.find({
      where: [
        { clientId: userId } as FindOptionsWhere<Conversation>,
        { professionalId: userId } as FindOptionsWhere<Conversation>,
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  private async assertMembership(conversationId: string, userId: string) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversation not found');

    const isMember = conv.clientId === userId || conv.professionalId === userId;
    if (!isMember) throw new ForbiddenException('Not member of this conversation');

    return conv;
  }

  async listMessages(conversationId: string, userId: string, limit = 20, offset = 0) {
    await this.assertMembership(conversationId, userId);

    const [items, total] = await this.msgRepo.findAndCount({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return { total, limit, offset, items };
  }

  async sendMessage(dto: SendMessageDto, senderId: string) {
    const conv = await this.assertMembership(dto.conversationId, senderId);

    const msg = this.msgRepo.create({
      conversationId: conv.id,
      senderId,
      content: dto.content.trim(),
      readAt: null,
    });

    const saved = await this.msgRepo.save(msg);
    await this.convRepo.update(conv.id, { updatedAt: new Date() }); // bump activity
    return saved;
  }

  async markRead(messageId: string, userId: string) {
    const msg = await this.msgRepo.findOne({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');

    await this.assertMembership(msg.conversationId, userId);

    if (!msg.readAt) {
      msg.readAt = new Date();
      await this.msgRepo.save(msg);
    }
    return msg;
  }

  // === Simplified one-call endpoint ===
  async start(dto: StartConversationDto, requesterId: string) {
    // Accept either Professional.id or Users.id for the professional
    let professionalUserId = dto.professionalId;
    const pro = await this.proRepo.findOne({ where: { id: dto.professionalId }, relations: ['user'] });
    if (pro?.user?.id) {
      professionalUserId = pro.user.id; // map Professional.id -> Users.id
    }

    if (professionalUserId === requesterId) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }

    const conv = await this.upsertConversation(
      { clientId: requesterId, professionalId: professionalUserId },
      requesterId,
    );

    if (dto.content?.trim()) {
      await this.sendMessage({ conversationId: conv.id, content: dto.content.trim() }, requesterId);
    }

    return conv;
  }
}