import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Professional } from 'src/professional/entity/professional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, Professional])],
  controllers: [InboxController],
  providers: [InboxService],
})
export class InboxModule {}