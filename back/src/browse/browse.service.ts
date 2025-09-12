// back/src/browse/browse.service.ts
import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { ListQueryDto } from './dto/list-query.dto';
import { Paginated } from './types/paginated.type';

@Injectable()
export class BrowseService {
  /**
   * Búsqueda simple:
   * - Coincidencia parcial por columnas "searchable"
   * - Exact match priorizado via ORDER BY con CASE (sin addSelect)
   * - Orden alfabético fijo por sortColumn
   */
  async simpleSearch<T extends ObjectLiteral>(opts: {
    repo: Repository<T>;
    alias: string;
    dto: ListQueryDto;
    searchable: (keyof T)[];
    sortColumn: string; // ej: 'svc.title' | 'cat.name'
  }): Promise<Paginated<T>> {
    const { repo, alias, dto, searchable, sortColumn } = opts;
    const qb = repo.createQueryBuilder(alias);

    // 1) WHERE por texto (parcial)
    if (dto.q && searchable.length) {
      const like = `%${dto.q}%`;
      const ors = searchable.map((col, i) => `${alias}."${String(col)}" ILIKE :q${i}`);
      const params = Object.fromEntries(searchable.map((_, i) => [`q${i}`, like]));
      qb.andWhere(`(${ors.join(' OR ')})`, params);

      // 2) Exact-first SIN addSelect (solo ORDER BY por expresión)
      const exactExpr = searchable
        .map((col) => `LOWER(${alias}."${String(col)}") = LOWER(:exact)`)
        .join(' OR ');
      qb.addOrderBy(`CASE WHEN (${exactExpr}) THEN 0 ELSE 1 END`, 'ASC');
      qb.setParameter('exact', dto.q);
    }

    // 3) Orden alfabético estable
    qb.addOrderBy(sortColumn, 'ASC');

    // 4) Paginación
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    qb.take(limit).skip((page - 1) * limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }
}