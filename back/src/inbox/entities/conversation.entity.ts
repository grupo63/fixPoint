import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Message } from './message.entity';

@Entity({ name: 'inbox_conversations' })
@Unique(['clientId', 'professionalId'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  clientId: string;

  @Index()
  @Column({ type: 'uuid' })
  professionalId: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'archived';

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'professionalId' })
  professional: User;

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}