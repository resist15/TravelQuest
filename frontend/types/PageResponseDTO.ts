export interface PageResponseDTO<T> {
  content: T[];
  pageNumber: number;
  totalPages: number;
  totalElements: number;
}
