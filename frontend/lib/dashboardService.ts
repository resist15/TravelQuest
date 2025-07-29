import api from "@/lib/axios";

export interface DashboardStats {
 totalAdventures: number;
  countriesVisited: number;
  regionsVisited: number;
  citiesVisited: number;
}

export const getDashboardStats = async () => {
  const res = await api.get<DashboardStats>("/api/adventures/stats");
  return res.data;
};