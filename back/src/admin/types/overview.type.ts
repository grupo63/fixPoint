export interface AdminOverview {
  users: { total: number; active: number; newLast7d: number };
  professionals: { total: number; active: number };
  services: { total: number };
  categories: { total: number; active: number };
  reservations: { total: number };
  reviews: { total: number; avgRate: number | null };
}