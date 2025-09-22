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
      this.users
        .createQueryBuilder('u')
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
      this.reviews.createQueryBuilder('r').select('AVG(r.rate)', 'avg').getRawOne<{ avg: string | null }>(),
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
      'u.id',
      'u.email',
      'u.role',
      'u.firstName',
      'u.lastName',
      'u.isActive',
      'u.createdAt',
    ]);

    if (q?.trim()) {
      const like = `%${q.trim()}%`;
      qb.andWhere('(u.email ILIKE :like OR u."firstName" ILIKE :like OR u."lastName" ILIKE :like)', { like });
    }

    if (status === 'active') qb.andWhere('u.isActive = :a', { a: true });
    if (status === 'inactive') qb.andWhere('u.isActive = :a', { a: false });

    qb.orderBy('u.createdAt', 'DESC').take(limit).skip((page - 1) * limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  /**
   * Métricas para gráficas en /admin/users/stats
   *  - distribution: total vs activos vs inactivos
   *  - createdLast14d: nuevos usuarios por día (últimos 14 días)
   *  - latestServices: últimos 15 servicios contratados (fallback por última review)
   *  - topProfessionals: top 10 por rating promedio (desempate por cantidad de reviews)
   *  - topUsersNonProfessionals: top 10 clientes por reservas CONFIRMED
   */
  async usersStats() {
    // --- existentes ---
    const [total, active, inactive] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { isActive: true } }),
      this.users.count({ where: { isActive: false } }),
    ]);

    const rows = await this.users
      .createQueryBuilder('u')
      .select(`to_char(date_trunc('day', u."createdAt"), 'YYYY-MM-DD')`, 'day')
      .addSelect('COUNT(*)', 'count')
      .where(`u."createdAt" >= NOW() - INTERVAL '14 days'`)
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; count: string }>();

    const createdLast14d = rows.map((r) => ({ day: r.day, count: Number(r.count) }));

    // --- nuevas ---
    const [latestServices, topProfessionals, topUsersNonProfessionals] = await Promise.all([
      this.lastServices(15),
      this.topProfessionals(10),
      this.topUsersNonProfessionals(10),
    ]);

    return {
      distribution: { total, active, inactive },
      createdLast14d,
      latestServices,
      topProfessionals,
      topUsersNonProfessionals,
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

  // ======= NUEVOS MÉTODOS (aditivos) =======

  /** KPIs simples para el dashboard (/dashboard) */
  async overviewCounters() {
    const [totalUsers, totalUsersActive, totalUsersInactive, totalReservations] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { isActive: true } }),
      this.users.count({ where: { isActive: false } }),
      this.reservations.count(),
    ]);

    return {
      totalUsers,
      totalReservations,
      totalUsersActive,
      totalUsersInactive,
    };
  }

  /** Últimos servicios contratados (fallback por última review si Reservation no tiene createdAt) */
  async lastServices(limit = 15) {
    // 1) ids ordenados por actividad reciente (fecha de review asociada)
    const idsRows = await this.reservations
      .createQueryBuilder('r')
      .leftJoin(Review, 'rev', 'rev.reservationId = r.reservationId')
      .select('r.reservationId', 'reservationId')
      .addSelect('MAX(rev."date")', 'lastReviewDate') // <— cita la columna y conserva alias CamelCase
      .groupBy('r.reservationId')
      .orderBy('"lastReviewDate"', 'DESC', 'NULLS LAST') // <— cita el alias CamelCase
      .addOrderBy('r.reservationId', 'DESC')
      .limit(limit)
      .getRawMany<{ reservationId: string; lastReviewDate: string | null }>();

    const ids = idsRows.map(r => r.reservationId);
    if (!ids.length) return [];

    // 2) cargar reservas con relaciones
    const list = await this.reservations
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'u')
      .leftJoinAndSelect('r.professional', 'p')
      .leftJoinAndSelect('p.user', 'pu')
      .where('r.reservationId IN (:...ids)', { ids })
      .getMany();

    const byId = new Map(list.map(r => [r.reservationId, r]));
    return ids.map(id => {
      const r: any = byId.get(id);
      const proUser: any = r?.professional?.user;
      const proName = [proUser?.firstName, proUser?.lastName].filter(Boolean).join(' ').trim() || proUser?.email || null;

      return {
        reservationId: r?.reservationId || id,
        status: r?.status ?? null,
        lastReviewDate: idsRows.find(x => x.reservationId === id)?.lastReviewDate ?? null,
        user: r?.user ? { id: r.user.id, email: (r.user as any).email } : null,
        professional: r?.professional
          ? { id: r.professional.id, fullName: proName, speciality: r.professional.speciality ?? null }
          : null,
      };
    });
  }

  /** Top 10 profesionales por rating promedio (desempate por cantidad de reviews) */
  async topProfessionals(limit = 10) {
    const rows = await this.reviews
      .createQueryBuilder('rev')
      .innerJoin('rev.professional', 'p')
      .select('p.id', 'id')
      .addSelect('COALESCE(AVG(rev.rate), 0)', 'avgRate')
      .addSelect('COUNT(rev.reviewId)', 'reviews')
      .groupBy('p.id')
      .orderBy('avgRate', 'DESC')
      .addOrderBy('reviews', 'DESC')
      .limit(limit)
      .getRawMany<{ id: string; avgRate: string; reviews: string }>();

    if (!rows.length) return [];

    const pros = await this.pros
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'pu')
      .where('p.id IN (:...ids)', { ids: rows.map(r => r.id) })
      .getMany();

    const byId = new Map(pros.map(p => [p.id, p]));
    const toFixed2 = (n: any) => Number(Number(n ?? 0).toFixed(2));

    return rows.map(r => {
      const p: any = byId.get(r.id);
      const pu = p?.user;
      const fullName = [pu?.firstName, pu?.lastName].filter(Boolean).join(' ').trim() || pu?.email || null;
      return {
        id: r.id,
        fullName,
        speciality: p?.speciality ?? null,
        avgRate: toFixed2(r.avgRate),
        reviews: Number(r.reviews ?? 0),
      };
    });
  }

  /** Top 10 usuarios NO profesionales por reservas confirmadas */
  async topUsersNonProfessionals(limit = 10) {
    const raw = await this.reservations
      .createQueryBuilder('r')
      .innerJoin('r.user', 'u')
      .where('u.role = :role', { role: 'user' })
      .andWhere('r.status = :done', { done: 'CONFIRMED' })
      .select('u.id', 'userId')
      .addSelect('u.email', 'email')
      .addSelect(`COALESCE(u."firstName" || ' ' || u."lastName", u.email)`, 'fullName')
      .addSelect('COUNT(r."reservationId")', 'confirmedCount') // <— cita la columna
      .groupBy('u.id')
      .addGroupBy('u.email')
      .addGroupBy('u."firstName"')
      .addGroupBy('u."lastName"')
      .orderBy('"confirmedCount"', 'DESC') // <— cita el alias CamelCase
      .limit(limit)
      .getRawMany<{ userId: string; email: string; fullName: string; confirmedCount: string }>();

    return raw.map(r => ({
      userId: r.userId,
      fullName: (r.fullName || r.email).trim(),
      confirmedRequests: Number(r.confirmedCount),
    }));
  }
}