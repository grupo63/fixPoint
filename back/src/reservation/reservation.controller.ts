import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // Público: crear reserva
  @Post()
  @ApiOperation({ summary: 'Crear una reserva' })
  @ApiResponse({ status: 201, description: 'Reserva creada', type: Reservation })
  create(@Body() dto: Partial<Reservation>) {
    return this.reservationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las reservas' })
  @ApiResponse({ status: 200, description: 'Lista de reservas', type: [Reservation] })
  findAll() {
    return this.reservationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiResponse({ status: 200, description: 'Reserva encontrada', type: Reservation })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una reserva' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiResponse({ status: 200, description: 'Reserva eliminada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.remove(id);
  }

  // Protegidos para profesional
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmar una reserva (profesional acepta)' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiResponse({ status: 200, description: 'Reserva confirmada', type: Reservation })
  confirm(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    // Logs de depuración
    console.log('CONFIRM headers.authorization:', req.headers?.authorization);
    console.log('CONFIRM cookies:', req.cookies);
    console.log('CONFIRM req.user:', req.user);

    if (!req?.user?.id) throw new UnauthorizedException('No autenticado');
    return this.reservationService.confirmReservation(id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel-by-professional')
  @ApiOperation({ summary: 'Cancelar una reserva (profesional rechaza)' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiResponse({
    status: 200,
    description: 'Reserva cancelada por el profesional',
    type: Reservation,
  })
  cancelByProfessional(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    console.log('CANCEL headers.authorization:', req.headers?.authorization);
    console.log('CANCEL cookies:', req.cookies);
    console.log('CANCEL req.user:', req.user);

    if (!req?.user?.id) throw new UnauthorizedException('No autenticado');
    return this.reservationService.cancelReservationByProfessional(id, req.user.id);
  }
}
