import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  create(data: Partial<Payment>) {
    return this.repo.create(data);
  }
  save(p: Payment) {
    return this.repo.save(p);
  }
  findByProviderPaymentId(providerPaymentId: string) {
    return this.repo.findOne({ where: { providerPaymentId } });
  }
  // agrega más métodos si los necesitás (paginación, por userId, etc.)
}
