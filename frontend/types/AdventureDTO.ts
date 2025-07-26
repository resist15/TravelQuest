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