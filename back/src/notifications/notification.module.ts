import { Module } from '@nestjs/common';
import { NotificationsService } from './notification.service';

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
