import Image from "next/image";
import Navbar from "./components/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Flag,
  MapPin,
  Building2,
} from "lucide-react";

export default function Home() {
  const adventures = [
    {
      id: 1,
      name: "Mar del Plata",
      location: "Mar del Plata, Buenos Aires, AR",
      tags: ["General 🌍", "Planned", "Private"],
      status: "planned",
      image: null,
    },
    {
      id: 2,
      name: "Hawai‘i County",
      location: "Hawai‘i County, Hawaii, US",
      tags: ["General 🌍", "Planned", "Private"],
      status: "planned",
      image: null,
    },
    {
      id: 3,
      name: "Sequoia National Park",
      location: "Tulare County, California, US",
      tags: ["National Park 🌍", "Visited", "Private"],
      status: "visited",
      image: null,
      visitCount: 1,
      keywords: ["trees", "california"],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Welcome back, Demo!</h1>

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

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Recent Adventures</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adventures.map((adv) => (
              <div
                key={adv.id}
                className="bg-muted rounded-xl overflow-hidden shadow-sm"
              >
                {adv.image ? (
                  <Image
                    src={adv.image}
                    alt={adv.name}
                    width={600}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center text-sm text-white">
                    No image found
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold">{adv.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {adv.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        className={
                          tag.includes("Planned")
                            ? "bg-green-500 text-white"
                            : tag.includes("Private")
                            ? "bg-pink-500 text-white"
                            : "bg-blue-600 text-white"
                        }
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">📍 {adv.location}</p>
                  {adv.visitCount && (
                    <p className="text-sm text-muted-foreground">🗓️ {adv.visitCount} Visit</p>
                  )}
                  {adv.keywords && (
                    <div className="flex flex-wrap gap-1 text-xs">
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
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
