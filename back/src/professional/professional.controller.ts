import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { UpdateProfessionalDto } from './dto/updateProfessional.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Professional } from './entity/professional.entity';

@ApiTags('Professional')
@Controller('professional')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all professinals',
    description:
      'Returns a paginated list of active professionals. By default, it returns 12 professionals per page, but you can customize this using query parameters.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination (default: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of professionals per page (default: 12)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of professionals retrieved successfully',
    type: Professional,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'No professionals found',
  })
  getProfessional(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 12;
    return this.professionalService.getProfessional(pageNumber, limitNumber);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get professional profile by ID',
    description:
      'Retrieves the professional profile associated with the given professional ID. Returns details such as specialty, location, and other attributes.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the professional to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Professional profile retrieved successfully',
    type: Professional,
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  getProfessionalById(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionalService.getProfessionalById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a professional profile',
    description:
      'Updates the details of an existing professional profile. Only the provided fields in the request body will be modified.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the professional to update',
    type: String,
  })
  @ApiBody({
    type: UpdateProfessionalDto,
    description: 'Partial professional data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Professional profile updated successfully',
    type: Professional,
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateProfessional(
    @Param('id') id: string,
    @Body() dto: UpdateProfessionalDto,
  ) {
    return this.professionalService.updateProfessional(id, dto);
  }

  @Put(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate a professional profile',
    description:
      'Marks a professional profile as inactive by setting the isActive property to false. Inactive professionals will not appear in standard queries.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the professional to deactivate',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Professional profile deactivated successfully',
    type: Professional,
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  async deactivateProfessional(@Param('id') id: string) {
    return this.professionalService.deactivateProfessional(id);
  }
}
