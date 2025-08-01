export interface CollectionDTO {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  adventureCount: number;
  existingAdventureIds: number[]
}