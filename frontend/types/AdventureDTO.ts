export interface AdventureDTO {
  id: number;
  name: string;
  location: string;
  tags: string[];
  description: string;
  rating: number;
  link: string;
  latitude: number;
  longitude: number;
  imageUrls: string[];
  createdAt: string;
}
export interface PageResponseDTO<T> {
  content: T[];
  pageNumber: number;
  totalPages: number;
  totalElements: number;
}
