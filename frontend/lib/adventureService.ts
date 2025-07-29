import api from "@/lib/axios";
import { AdventureDTO } from "@/types/AdventureDTO";
import { PageResponseDTO } from "@/types/PageResponseDTO";

export const getAdventuresPaginated = async (
  page = 0,
  size = 6,
  name?: string
) => {
  const res = await api.get<PageResponseDTO<AdventureDTO>>("/api/adventures/my", {
    params: { page, size, name },
  });

  console.log("👉 API Response from /my:", res.data); // ✅ Add this
  return res.data;
};

export const getRecentAdventures = async () => {
  const res = await api.get<AdventureDTO[]>("/api/adventures/recent");
  return res.data;
};

export const getAdventuresSorted = async (
  sortBy = "name",
  order = "asc"
) => {
  const res = await api.get<AdventureDTO[]>("/api/adventures/sortedBy", {
    params: { sortBy, order },
  });
  return res.data;
};
