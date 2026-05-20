export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
