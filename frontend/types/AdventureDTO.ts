export interface AdventureDTO {
  id: number;
  name: string;
  location: string;
  tags: string[];
  description: string;
  rating: number;
  link: string;
  publicVisibility: boolean;
  latitude: number;
  longitude: number;
  imageUrls: string[];
  createdAt: string;
}