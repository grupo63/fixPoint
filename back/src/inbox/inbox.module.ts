import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';

import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Professional } from 'src/professional/entity/professional.entity';
import { User } from 'src/users/entities/user.entity'; // <-- AJUSTA LA RUTA

@Module({
  imports: [
    // Agregamos User para que exista el UserRepository en este módulo
    TypeOrmModule.forFeature([Conversation, Message, Professional, User]),
  ],
  controllers: [InboxController],
  providers: [InboxService],
  exports: [InboxService], // opcional
})
export class InboxModule {}
