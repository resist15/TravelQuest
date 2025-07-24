"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const visitedPlaces: {
  name: string;
  coordinates: [number, number];
  country: string;
}[] = [
  { name: "San Francisco", coordinates: [-122.4194, 37.7749], country: "USA" },
  { name: "New York", coordinates: [-74.006, 40.7128], country: "USA" },
  { name: "Tokyo", coordinates: [139.6917, 35.6895], country: "Japan" },
];

export default function MapPage() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 20],
      zoom: 2,
    });

    mapRef.current = map;

    map.on("load", () => {
      visitedPlaces.forEach((place) => {
        new Marker({ color: "#007cbf" })
          .setLngLat(place.coordinates)
          .setPopup(new maplibregl.Popup().setText(place.name))
          .addTo(map);
      });

      const uniqueCountries = new Set(visitedPlaces.map((p) => p.country));
      const bounds = new maplibregl.LngLatBounds();
      visitedPlaces.forEach((place) => bounds.extend(place.coordinates));
      map.fitBounds(bounds, { padding: uniqueCountries.size === 1 ? 100 : 150 });
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <main className="bg-background text-foreground min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">🌍 Visited Locations</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="text-muted-foreground text-sm">
            Map showing where you’ve been. More interactivity coming soon!
          </CardContent>
        </Card>

        <div
          ref={containerRef}
          className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg"
        />
      </div>
    </main>
  );
}
