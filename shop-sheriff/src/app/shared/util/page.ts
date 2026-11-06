/** Paged list, as every list endpoint of shop-api returns it. */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
