import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Professional } from '../professional/entity/professional.entity';
import { Service } from '../service/entities/service.entity';
import { Category } from '../category/entities/category.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Review } from '../reviews/entities/review.entity';
import { RolesGuard } from '../auth/guards/roles.guards';

@Module({
  imports: [TypeOrmModule.forFeature([User, Professional, Service, Category, Reservation, Review])],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}