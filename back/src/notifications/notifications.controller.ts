// import { Controller, Get } from '@nestjs/common';
// import { NotificationsService } from './notification.service';

// @Controller('notifications')
// export class NotificationsController {
//   constructor(private readonly notificationsService: NotificationsService) {}

//   @Get('test-email')
//   async sendTestEmail() {
//     return this.notificationsService.sendTestEmail();
//   }
// }
import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('test')
  test() {
    return this.notifications.sendTestEmail();
  }
}
