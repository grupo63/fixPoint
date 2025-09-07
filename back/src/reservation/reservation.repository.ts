import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationRepository extends Repository<Reservation> {
  constructor(private dataSource: DataSource) {
    super(Reservation, dataSource.createEntityManager());
  }
}
