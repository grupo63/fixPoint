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
import { CreateReservationDto } from './dto/create-reservation.dto';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // Público: crear reserva
  @Post()
  @ApiOperation({ summary: 'Crear una reserva' })
  @ApiResponse({ status: 201, description: 'Reserva creada', type: Reservation })
  create(@Body() dto: CreateReservationDto) {
    return this.reservationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las reservas' })
  @ApiResponse({ status: 200, description: 'Lista de reservas', type: [Reservation] })
  findAll() {
    return this.reservationService.findAll();
  }

  // Pendientes para un profesional (incluye user con profileImage)
  @Get('pending/:professionalId')
  @ApiOperation({ summary: 'Listar reservas pendientes para un profesional' })
  @ApiParam({ name: 'professionalId', description: 'UUID del profesional', type: String })
  @ApiResponse({ status: 200, description: 'Lista de reservas pendientes', type: [Reservation] })
  getPending(@Param('professionalId', ParseUUIDPipe) professionalId: string) {
    return this.reservationService.getPendingForProfessional(professionalId);
  }

  // ✅ Nuevo: datos básicos del cliente de una reserva (solo si el profesional es dueño)
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/client')
  @ApiOperation({ summary: 'Obtener datos básicos del cliente de una reserva' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiResponse({ status: 200, description: 'Datos del cliente (básicos)' })
  getClientForReservation(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    if (!req?.user?.id) throw new UnauthorizedException('No autenticado');
    return this.reservationService.getClientForReservation(id, req.user.id);
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
    if (!req?.user?.id) throw new UnauthorizedException('No autenticado');
    return this.reservationService.cancelReservationByProfessional(id, req.user.id);
  }
}
