import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/createProfessional.dto';

@Controller('professional')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}
  @Get()
  getProfessional(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 12;
    return this.professionalService.getProfessional(pageNumber, limitNumber);
  }

  @Get(':id')
  getProfessionalById(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionalService.getProfessionalById(id);
  }

  @Post(':userId')
  async createProfessional(
    @Param('userId') userId: string,
    @Body() professional: CreateProfessionalDto,
  ) {
    return this.professionalService.createProfessional(userId, professional);
  }
}
