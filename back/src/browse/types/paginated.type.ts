export type Paginated<T> = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
};