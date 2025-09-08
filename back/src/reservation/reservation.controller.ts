import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Reservation')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creates a new reservation' })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The reservation has been successfully created.',
    type: CreateReservationDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieves all reservations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A list of all reservations.',
    type: [CreateReservationDto],
  })
  findAll() {
    return this.reservationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieves a single reservation by its ID' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the reservation.',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reservation was found successfully.',
    type: CreateReservationDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reservation not found.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Updates an existing reservation' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the reservation.',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateReservationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reservation has been successfully updated.',
    type: CreateReservationDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reservation not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a reservation' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the reservation to delete.',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The reservation has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reservation not found.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.remove(id);
  }
}
