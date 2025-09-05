import { Module } from '@nestjs/common';
import { ProfessionalController } from './professional.controller';
import { ProfessionalService } from './professional.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from './entity/professional.entity';
import { ProfessionalRepository } from './professional.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Professional])],
  controllers: [ProfessionalController],
  providers: [ProfessionalService, ProfessionalRepository],
  exports: [ProfessionalRepository],
})
export class ProfessionalModule {}
