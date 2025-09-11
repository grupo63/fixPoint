import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AvailableService } from './available.service';
import { CreateAvailabilityDto } from './dto/createAvailabilty.dto';
import { Available } from './entity/available.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @Get(':id')
  @ApiOperation({ summary: 'retrieve availability by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Availability found',
    type: Available,
  })
  async findOne(@Param('id') id: string): Promise<Available> {
    return this.availableService.findOne(id);
  }
}
