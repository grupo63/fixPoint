import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProfessionalService } from './professional.service';

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
}
