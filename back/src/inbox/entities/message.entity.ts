import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'inbox_messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  conversationId: string;

  @Index()
  @Column({ type: 'uuid' })
  senderId: string; // must be clientId or professionalId

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  readAt: Date | null;

  @ManyToOne(() => Conversation, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}