import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Professional } from '../professional/entity/professional.entity';
import { Service } from '../service/entities/service.entity';
import { Category } from '../category/entities/category.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Review } from '../reviews/entities/review.entity';
import { AdminOverview } from './types/overview.type';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Professional) private readonly pros: Repository<Professional>,
    @InjectRepository(Service) private readonly services: Repository<Service>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Reservation) private readonly reservations: Repository<Reservation>,
    @InjectRepository(Review) private readonly reviews: Repository<Review>,
  ) {}

  async overview(): Promise<AdminOverview> {
    const [usersTotal, usersActive, usersNew7d] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { isActive: true } }),
      this.users.createQueryBuilder('u')
        .where(`u."createdAt" >= NOW() - INTERVAL '7 days'`)
        .getCount(),
    ]);

    const [prosTotal, prosActive] = await Promise.all([
      this.pros.count(),
      this.pros.count({ where: { isActive: true } }),
    ]);

    const [servicesTotal, categoriesTotal, categoriesActive, reservationsTotal] = await Promise.all([
      this.services.count(),
      this.categories.count(),
      this.categories.count({ where: { isActive: true } }),
      this.reservations.count(),
    ]);

    const [reviewsTotal, avgRow] = await Promise.all([
      this.reviews.count(),
      this.reviews.createQueryBuilder('r')
        .select('AVG(r.rate)', 'avg')
        .getRawOne<{ avg: string | null }>(),
    ]);

    const avgRate = avgRow?.avg ? Number(avgRow.avg) : null;

    return {
      users: { total: usersTotal, active: usersActive, newLast7d: usersNew7d },
      professionals: { total: prosTotal, active: prosActive },
      services: { total: servicesTotal },
      categories: { total: categoriesTotal, active: categoriesActive },
      reservations: { total: reservationsTotal },
      reviews: { total: reviewsTotal, avgRate },
    };
  }

  async listUsers(
    q: string | undefined,
    status: 'all' | 'active' | 'inactive' = 'all',
    page = 1,
    limit = 10,
  ) {
    const qb = this.users.createQueryBuilder('u').select([
      'u.id', 'u.email', 'u.role', 'u.firstName', 'u.lastName', 'u.isActive', 'u.createdAt',
    ]);

    if (q?.trim()) {
      const like = `%${q.trim()}%`;
      qb.andWhere('(u.email ILIKE :like OR u."firstName" ILIKE :like OR u."lastName" ILIKE :like)', { like });
    }

    if (status === 'active')   qb.andWhere('u.isActive = :a', { a: true });
    if (status === 'inactive') qb.andWhere('u.isActive = :a', { a: false });
    // "all" => sin filtro

    qb.orderBy('u.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  /**
   * Métricas simples para gráficas
   *  - distribution: total vs activos vs inactivos
   *  - createdLast14d: nuevos usuarios por día (últimos 14 días)
   */
  async usersStats() {
    const [total, active, inactive] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { isActive: true } }),
      this.users.count({ where: { isActive: false } }),
    ]);

    const rows = await this.users.createQueryBuilder('u')
      .select(`to_char(date_trunc('day', u."createdAt"), 'YYYY-MM-DD')`, 'day')
      .addSelect('COUNT(*)', 'count')
      .where(`u."createdAt" >= NOW() - INTERVAL '14 days'`)
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; count: string }>();

    const createdLast14d = rows.map(r => ({ day: r.day, count: Number(r.count) }));

    return {
      distribution: { total, active, inactive },
      createdLast14d,
    };
  }

  async setUserRole(id: string, role: 'user' | 'professional' | 'admin') {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    (user as any).role = role;
    await this.users.save(user);
    const { password, ...safe } = user as any;
    return safe;
  }

  async deactivateUser(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = false;
    await this.users.save(user);
    const { password, ...safe } = user as any;
    return safe;
  }

  async reactivateUser(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = true;
    await this.users.save(user);
    const { password, ...safe } = user as any;
    return safe;
  }
}