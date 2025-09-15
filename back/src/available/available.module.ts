import { Module } from '@nestjs/common';
import { AvailableController } from './available.controller';
import { AvailableService } from './available.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Available } from './entity/available.entity';
import { Professional } from 'src/professional/entity/professional.entity';
import { ProfessionalRepository } from 'src/professional/professional.repository';
import { AvailableRepository } from './available.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Available, Professional]), UsersModule],
  controllers: [AvailableController],
  providers: [AvailableService, AvailableRepository, ProfessionalRepository],
  exports: [TypeOrmModule],
})
export class AvailableModule {}
