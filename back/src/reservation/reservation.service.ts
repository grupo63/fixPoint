import { Injectable, NotFoundException } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { User } from 'src/users/entities/user.entity';
import { Professional } from 'src/professional/entity/professional.entity';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Professional)
    private readonly professionalRepo: Repository<Professional>,
  ) {}

  async create(createDto: CreateReservationDto): Promise<Reservation> {
    const user = await this.userRepo.findOne({
      where: { id: createDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${createDto.userId} not found`);
    }

    const professional = await this.professionalRepo.findOne({
      where: { id: createDto.professionalId },
    });

    if (!professional) {
      throw new NotFoundException(
        `Professional with id ${createDto.professionalId} not found`,
      );
    }
    const reservation = this.reservationRepo.create({
      ...createDto,
      user,
      professional,
    });

    return await this.reservationRepo.save(reservation);
  }

  async findAll(): Promise<Reservation[]> {
    return await this.reservationRepo.find({
      relations: ['user', 'professional'],
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { reservationId: id },
      relations: ['user', 'professional'],
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async update(
    id: string,
    updateDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    Object.assign(reservation, {
      ...updateDto,
      ...(updateDto.userId && { user: { userId: updateDto.userId } as any }),
      ...(updateDto.professionalId && {
        professional: { pId: updateDto.professionalId } as any,
      }),
    });

    return await this.reservationRepo.save(reservation);
  }

  async remove(id: string): Promise<{ message: string }> {
    const reservation = await this.findOne(id);
    await this.reservationRepo.remove(reservation);
    return { message: 'Reservation delete succesfully' };
  }
}
