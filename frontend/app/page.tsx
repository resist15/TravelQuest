"use client";

import Image from "next/image";
import Navbar from "./components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Plane, Flag, MapPin, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDashboardStats, DashboardStats } from "@/lib/dashboardService";

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("User");
  const [adventures, setAdventures] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
  totalAdventures: 0,
  countriesVisited: 0,
  regionsVisited: 0,
  citiesVisited: 0,
});


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        JSON.parse(atob(token.split(".")[1]));

        const [userRes, adventuresRes, statsRes] = await Promise.all([
          api.get("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/adventures/recent", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getDashboardStats(),
        ]);

        setUserName(userRes.data.name || "User");

        const data = adventuresRes.data;
        setAdventures(Array.isArray(data) ? data : data?.content || []);

        setStats(statsRes);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401) router.push("/login");
      }
    };

    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          Welcome back, {userName}!
        </h1>

        {/* ✅ Dynamic Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center">
            <p className="text-3xl font-bold text-pink-500">
              {stats.totalAdventures}
            </p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Plane className="w-4 h-4 text-pink-500" /> Total Adventures
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center">
            <p className="text-3xl font-bold text-blue-500">
              {stats.countriesVisited}
            </p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Flag className="w-4 h-4 text-blue-500" /> Countries Visited
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center">
            <p className="text-3xl font-bold text-green-500">
              {stats.regionsVisited}

            </p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <MapPin className="w-4 h-4 text-green-500" /> Total Visited Regions
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center">
            <p className="text-3xl font-bold text-cyan-500">
            {stats.citiesVisited}

            </p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Building2 className="w-4 h-4 text-cyan-500" /> Total Visited
              Cities
            </div>
          </div>
        </div>

        {/* Adventures Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Recent Adventures</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adventures.map((adv) => (
              <Card
                key={adv.id}
                className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer p-0"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={
                      adv.imageUrls?.[0] ||
                      "https://via.placeholder.com/400"
                    }
                    alt={adv.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="pt-0 px-4 pb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{adv.name}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    📍 {adv.location}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(adv.tags) &&
                      adv.tags.map((tag: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs border-muted-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
