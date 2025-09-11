import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrowseController } from './browse.controller';
import { BrowseService } from './browse.service';

import { Service as Svc } from '../service/entities/service.entity';
import { Category } from '../category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Svc, Category])],
  controllers: [BrowseController],
  providers: [BrowseService],
  exports: [BrowseService],
})
export class BrowseModule {}