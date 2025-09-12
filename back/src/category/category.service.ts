import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  create(dto: CreateCategoryDto) {
    return this.repository.create(dto);
  }
  findAll() {
    return this.repository.findAll();
  }
  findOne(id: string) {
    return this.repository.findOne(id);
  }
  update(id: string, dto: UpdateCategoryDto) {
    return this.repository.update(id, dto);
  }
  remove(id: string) {
    return this.repository.remove(id);
  }
}
