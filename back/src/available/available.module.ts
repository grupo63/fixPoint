import { Module } from '@nestjs/common';
import { AvailableController } from './available.controller';
import { AvailableService } from './available.service';

@Module({
  controllers: [AvailableController],
  providers: [AvailableService]
})
export class AvailableModule {}
