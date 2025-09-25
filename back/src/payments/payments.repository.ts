import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  findByProviderPaymentId(pi: string) {
    return this.repo.findOne({ where: { providerPaymentId: pi } });
  }

  findByProviderInvoiceId(inv: string) {
    return this.repo.findOne({ where: { providerInvoiceId: inv } });
  }

  findByCheckoutSessionId(id: string) {
    return this.repo.findOne({ where: { providerCheckoutSessionId: id } });
  }

  save(payment: Payment) {
    return this.repo.save(payment);
  }

  create(partial: Partial<Payment>) {
    return this.repo.create(partial);
  }

  getGlobalStats(): Repository<Payment> {
    return this.repo;
  }
}
