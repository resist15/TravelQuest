"use client";

import Image from "next/image";
import Navbar from "./components/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Flag,
  MapPin,
  Building2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
    const router = useRouter();
    const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        JSON.parse(atob(token.split('.')[1]));
        const [userRes] = await Promise.all([
          api.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUserName(userRes.data.name || 'User');
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401) router.push('/login');
      } finally {
      }
    };
    fetchData();
  }, [router]);

  const adventures = [
    {
      id: 1,
      name: "Mar del Plata",
      location: "Mar del Plata, Buenos Aires, AR",
      tags: ["General 🌍", "Planned", "Private"],
      status: "planned",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "Hawai‘i County",
      location: "Hawai‘i County, Hawaii, US",
      tags: ["General 🌍", "Planned", "Private"],
      status: "planned",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "Sequoia National Park",
      location: "Tulare County, California, US",
      tags: ["National Park 🌍", "Visited", "Private"],
      status: "visited",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      visitCount: 1,
      keywords: ["trees", "california"],
    },

    
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Welcome back, {userName}!</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center">
            <p className="text-3xl font-bold text-pink-500">14</p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Plane className="w-4 h-4 text-pink-500" /> Total Adventures
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center">
            <p className="text-3xl font-bold text-blue-500">3</p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Flag className="w-4 h-4 text-blue-500" /> Countries Visited
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center">
            <p className="text-3xl font-bold text-green-500">4</p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <MapPin className="w-4 h-4 text-green-500" /> Total Visited Regions
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 flex flex-col justify-center">
            <p className="text-3xl font-bold text-cyan-500">2</p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Building2 className="w-4 h-4 text-cyan-500" /> Total Visited Cities
            </div>
          </div>
        </div>

        {/* Adventures */}
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
                    src={adv.image}
                    alt={adv.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="pt-0 px-4 pb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{adv.name}</h3>
                    {adv.status && (
                      <Badge
                        className={
                          adv.status === "planned"
                            ? "bg-green-500 text-white"
                            : "bg-blue-600 text-white"
                        }
                      >
                        {adv.status}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">📍 {adv.location}</p>
                  {adv.visitCount && (
                    <p className="text-sm text-muted-foreground">
                      🗓️ {adv.visitCount} Visit
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {adv.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs border-muted-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {adv.keywords && (
                    <div className="flex flex-wrap gap-1 text-xs pt-1">
                      {adv.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="bg-background border border-muted px-2 py-0.5 rounded-full"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
