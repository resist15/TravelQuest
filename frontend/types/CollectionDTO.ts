export interface CollectionDTO {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  durationInDays: number;
  adventureCount: number;
  existingAdventureIds: number[]
}