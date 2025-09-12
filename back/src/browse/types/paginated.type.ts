export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}