import { Injectable } from '@nestjs/common';
import { ServiceRepository } from './service.repository';
import { CreateServiceDto } from './dto/createService.dto';
import { UpdateServiceDto } from './dto/updateService.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly repository: ServiceRepository) {}

  create(dto: CreateServiceDto) {
    return this.repository.createOne(dto);
  }
  findAll() {
    return this.repository.findAll();
  }
  findOne(id: string) {
    return this.repository.findOne(id);
  }
  update(id: string, dto: UpdateServiceDto) {
    return this.repository.updateOne(id, dto);
  }
  remove(id: string) {
    return this.repository.removeOne(id);
  }
}