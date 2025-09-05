import { Controller } from '@nestjs/common';

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
}
