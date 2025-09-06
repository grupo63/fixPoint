import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { ServiceRepository } from './service.repository';
import { Category } from '../category/entities/category.entity';
import { Professional } from '../professional/entity/professional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Category, Professional])],
  controllers: [ServiceController],
  providers: [ServiceService, ServiceRepository],
  exports: [TypeOrmModule, ServiceRepository],
})
export class ServiceModule {}