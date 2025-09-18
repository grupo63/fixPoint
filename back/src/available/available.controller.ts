import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AvailableService } from './available.service';
import { CreateAvailabilityDto } from './dto/createAvailabilty.dto';
import { Available } from './entity/available.entity';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('available')
@Controller('available')
export class AvailableController {
  constructor(private readonly availableService: AvailableService) {}

  @Post(':professionalId')
  @ApiOperation({ summary: 'Create professionals availability' })
  @ApiBody({ type: CreateAvailabilityDto })
  @ApiResponse({
    status: 201,
    description: 'Availability created succesfully',
    type: Available,
  })
  @ApiResponse({
    status: 404,
    description: 'Professional was not found',
  })
  createA(
    @Param('professionalId', new ParseUUIDPipe()) professionalId: string,
    @Body() dto: CreateAvailabilityDto,
  ): Promise<Available> {
    return this.availableService.createA(professionalId, dto);
  }

  // ⚠️ Importante: esta ruta va ANTES de ":id" para evitar conflictos
  @Get('professional/:professionalId')
  @ApiOperation({ summary: 'List professional availability (weekly)' })
  @ApiQuery({
    name: 'dayOfWeek',
    required: false,
    type: Number,
    description: 'Filtro opcional: día de la semana. 0=Dom..6=Sáb (o 1..7 si tu modelo lo usa)',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability list',
    type: [Available],
  })
  listByProfessional(
    @Param('professionalId', new ParseUUIDPipe()) professionalId: string,
    @Query('dayOfWeek') dayOfWeek?: string,
  ): Promise<Available[]> {
    const dow =
      dayOfWeek !== undefined && dayOfWeek !== null
        ? Number(dayOfWeek)
        : undefined;
    return this.availableService.listByProfessional(professionalId, dow);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve availability by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Availability found',
    type: Available,
  })
  async findOne(@Param('id') id: string): Promise<Available> {
    return this.availableService.findOne(id);
  }
}
