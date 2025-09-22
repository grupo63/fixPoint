import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { StartConversationDto } from './dto/start-conversation.dto';
import { Professional } from 'src/professional/entity/professional.entity';

// 👇 Ajustá esta ruta a tu entity real si difiere:
import { User } from 'src/users/entities/user.entity';

/* ========= Tipos de vista para el front ========= */
type PeerView = {
  type: 'professional' | 'client';
  professionalId: string | null; // id de la entidad Professional (si lo tenemos)
  userId: string | null;         // id del Users (peer)
  name: string;
  avatar: string | null;
};

type LastMessageView = {
  id: string;
  content: string;
  createdAt: Date;
} | null;

type ConversationView = {
  id: string;
  clientId: string;
  professionalId: string; // en tu modelo puede ser Users.id o Professional.id
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: LastMessageView;
  unreadCount: number;
  peer: PeerView;
};

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
    @InjectRepository(Professional)
    private readonly proRepo: Repository<Professional>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  /**
   * ✅ Devuelve conversaciones del usuario con:
   *  - peer { type, professionalId, userId, name, avatar }
   *  - lastMessage { id, content, createdAt } | null
   *  - unreadCount (placeholder 0)
   *
   * Atiende ambos esquemas posibles de Conversation.professionalId:
   *   - guarda Users.id del profesional  → resolvemos por user.id
   *   - guarda Professional.id           → resolvemos por professional.id
   *
   * Además, cuando el que consulta es el PROFESIONAL, resolvemos
   * los datos del CLIENTE (User) para mostrar nombre y avatar reales.
   */
  async listMyConversations(userId: string): Promise<ConversationView[]> {
    // 1) Mis conversaciones (como cliente o como profesional)
    const convs = await this.convRepo.find({
      where: [
        { clientId: userId } as FindOptionsWhere<Conversation>,
        { professionalId: userId } as FindOptionsWhere<Conversation>,
      ],
      order: { updatedAt: 'DESC' },
    });

    if (!convs.length) return [];

    // 2) ids que vienen en professionalId de las conversaciones
    const proIdCandidates = Array.from(
      new Set(convs.map((c) => c.professionalId).filter(Boolean)),
    ) as string[];

    // Lookup por user.id (del profesional)
    let prosByUserId: Professional[] = [];
    if (proIdCandidates.length) {
      prosByUserId = await this.proRepo.find({
        where: { user: { id: In(proIdCandidates) } as any },
        relations: ['user'],
      });
    }

    // Lookup por professional.id
    let prosByProId: Professional[] = [];
    if (proIdCandidates.length) {
      prosByProId = await this.proRepo.find({
        where: { id: In(proIdCandidates) },
        relations: ['user'],
      });
    }

    const proMapByUserId = new Map<string, Professional>();
    for (const p of prosByUserId) {
      const uid = p?.user?.id;
      if (uid) proMapByUserId.set(uid, p);
    }
    const proMapByProId = new Map<string, Professional>();
    for (const p of prosByProId) {
      if (p?.id) proMapByProId.set(p.id, p);
    }

    // 3) Resolver CLIENTES (para mostrar cuando el que consulta es el profesional)
    const clientIds = Array.from(new Set(convs.map((c) => c.clientId))).filter(Boolean) as string[];
    const clientUsers = clientIds.length
      ? await this.userRepo.find({
          where: { id: In(clientIds) },
        })
      : [];
    const clientMap = new Map<string, User>();
    for (const u of clientUsers) clientMap.set(u.id, u);

    // 4) Armar la vista final (incluye lastMessage)
    const results: ConversationView[] = await Promise.all(
      convs.map(async (c) => {
        const last = await this.msgRepo.findOne({
          where: { conversationId: c.id },
          order: { createdAt: 'DESC' },
          select: ['id', 'content', 'createdAt'],
        });

        const isCallerClient = c.clientId === userId;

        const peer: PeerView = isCallerClient
          ? this.buildProfessionalPeerFlexible(
              c.professionalId,
              proMapByUserId,
              proMapByProId,
            )
          : this.buildClientPeerFromMap(c.clientId, clientMap); // 👈 ahora nombre+foto reales del cliente

        return {
          id: c.id,
          clientId: c.clientId,
          professionalId: c.professionalId,
          status: c.status as any,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          lastMessage: last
            ? { id: last.id, content: last.content, createdAt: last.createdAt }
            : null,
          unreadCount: 0,
          peer,
        };
      }),
    );

    return results;
  }

  /* ===== Helpers para construir el peer ===== */

  private buildProfessionalPeerFlexible(
    professionalIdFromConversation: string,
    proByUserId: Map<string, Professional>,
    proByProId: Map<string, Professional>,
  ): PeerView {
    // 1) ¿matchea como user.id?
    let pro = proByUserId.get(professionalIdFromConversation);

    // 2) ¿matchea como professional.id?
    if (!pro) {
      pro = proByProId.get(professionalIdFromConversation);
    }

    const name =
      (pro as any)?.name ||
      [pro?.user?.firstName, pro?.user?.lastName].filter(Boolean).join(' ').trim() ||
      pro?.user?.email ||
      'Profesional';

    const avatar =
      (pro?.user as any)?.profileImage ||
      (pro?.user as any)?.imageUrl ||
      null;

    return {
      type: 'professional',
      professionalId: pro?.id ?? null,               // id de Professional si lo tenemos
      userId: pro?.user?.id ?? null,                 // id de Users del profesional si lo tenemos
      name,
      avatar,
    };
  }

  private buildClientPeerFromMap(clientUserId: string, clientMap: Map<string, User>): PeerView {
    const u = clientMap.get(clientUserId);
    const name =
      [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() ||
      (u as any)?.displayName ||
      u?.email ||
      'Usuario';

    const avatar =
      (u as any)?.profileImage ||
      (u as any)?.profileImg ||
      (u as any)?.imageUrl ||
      null;

    return {
      type: 'client',
      professionalId: null,
      userId: clientUserId,
      name,
      avatar,
    };
  }

  /* ====== Guardias y resto de endpoints ====== */

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
    // Acepta Professional.id o Users.id para el profesional
    let professionalUserId = dto.professionalId;

    const pro = await this.proRepo.findOne({
      where: { id: dto.professionalId },
      relations: ['user'],
    });

    if (pro?.user?.id) {
      // mapear Professional.id -> Users.id
      professionalUserId = pro.user.id;
    }

    if (professionalUserId === requesterId) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }

    const conv = await this.upsertConversation(
      { clientId: requesterId, professionalId: professionalUserId },
      requesterId,
    );

    if (dto.content?.trim()) {
      await this.sendMessage(
        { conversationId: conv.id, content: dto.content.trim() },
        requesterId,
      );
    }

    return conv;
  }
}
