import { Module } from '@nestjs/common';
import { ProfessionalController } from './professional.controller';
import { ProfessionalService } from './professional.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from './entity/professional.entity';
import { ProfessionalRepository } from './professional.repository';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Professional, User]), UsersModule],
  controllers: [ProfessionalController],
  providers: [ProfessionalService, ProfessionalRepository],
  exports: [ProfessionalRepository, UsersModule],
})
export class ProfessionalModule {}
