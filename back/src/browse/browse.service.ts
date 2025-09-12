import { Injectable } from '@nestjs/common';
import {
  Repository,
  SelectQueryBuilder,
  ObjectLiteral,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ListQueryDto } from './dto/list-query.dto';
import { Paginated } from './types/paginated.type';

import { Service as Svc } from '../service/entities/service.entity';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class BrowseService {
  constructor(
    @InjectRepository(Svc) private readonly serviceRepo: Repository<Svc>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
  ) {}

  /**
   * List Services with search & filters
   */
  async listServices(dto: ListQueryDto): Promise<Paginated<Svc>> {
    return this.run<Svc>(
      this.serviceRepo,
      'svc',
      dto,
      // 🔎 columns used for text search (adjust to your Service entity)
      ['title', 'description'],
      (qb, d) => {
        // categoryId filter
        if ((d as any).categoryId) {
          qb.andWhere('svc.categoryId = :categoryId', {
            categoryId: (d as any).categoryId,
          });
        }

        // isActive filter (string "true"/"false" or boolean)
        if ((d as any).isActive !== undefined) {
          const isActive =
            typeof (d as any).isActive === 'string'
              ? (d as any).isActive === 'true'
              : Boolean((d as any).isActive);
          qb.andWhere('svc.isActive = :isActive', { isActive });
        }

        // price range (if your Service entity has 'price')
        if ((d as any).minPrice) {
          qb.andWhere('svc.price >= :minPrice', { minPrice: (d as any).minPrice });
        }
        if ((d as any).maxPrice) {
          qb.andWhere('svc.price <= :maxPrice', { maxPrice: (d as any).maxPrice });
        }
      },
    );
  }

  /**
   * List Categories with search & filters
   */
  async listCategories(dto: ListQueryDto): Promise<Paginated<Category>> {
    return this.run<Category>(
      this.categoryRepo,
      'cat',
      dto,
      // 🔎 columns used for text search
      ['name', 'description'],
      (qb, d) => {
        // isActive filter (string "true"/"false" or boolean)
        if ((d as any).isActive !== undefined) {
          const isActive =
            typeof (d as any).isActive === 'string'
              ? (d as any).isActive === 'true'
              : Boolean((d as any).isActive);
          qb.andWhere('cat.isActive = :isActive', { isActive });
        }
      },
    );
  }

  /**
   * Generic runner: search, filters, sort, pagination
   */
  async run<T extends ObjectLiteral>(
    repo: Repository<T>,
    alias: string,
    dto: ListQueryDto,
    // keys of T that are strings so we can build `${alias}.${col}`
    searchCols: Array<keyof T & string>,
    applyFilters?: (qb: SelectQueryBuilder<T>, d: ListQueryDto) => void,
  ): Promise<Paginated<T>> {
    const { page, limit, sortBy, order, q } = dto;
    const qb = repo.createQueryBuilder(alias);

    // Text search
    if (q) {
      const like = `%${q}%`;
      const [first, ...rest] = searchCols;
      if (first) qb.where(`${alias}.${first} ILIKE :like`, { like });
      for (const col of rest) {
        qb.orWhere(`${alias}.${col} ILIKE :like`, { like });
      }
    }

    // Resource-specific filters
    if (applyFilters) applyFilters(qb, dto);

    // Sorting
    if (sortBy) {
      qb.orderBy(`${alias}.${sortBy}`, (order ?? 'ASC') as 'ASC' | 'DESC');
    }

    // Pagination
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }
}