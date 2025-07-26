"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import axios from "@/lib/axios";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plane, Globe2, Star } from "lucide-react"; // Import Star icon

interface Adventure {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  location: string;
  rating: number;
}

export default function MapPage() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerInstancesRef = useRef<Marker[]>([]);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    const fetchAdventures = async () => {
      try {
        const res = await axios.get<Adventure[]>("/api/adventures");
        setAdventures(res.data);
      } catch (err) {
        console.error("Failed to fetch adventures:", err);
      }
    };

    fetchAdventures();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://api.maptiler.com/maps/streets/style.json?key=hCWgkMCmHCAFZw9YCnLa",
      center: [0, 20],
      zoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || adventures.length === 0) return;

    if (markerInstancesRef.current.length > 0) {
      markerInstancesRef.current.forEach(m => m.remove());
      markerInstancesRef.current = [];
    }

    adventures.forEach((adventure) => {
      new Marker({ color: "#007cbf" })
        .setLngLat([adventure.longitude, adventure.latitude])
        .setPopup(new maplibregl.Popup().setText(adventure.name))
        .addTo(map);
    });

    const bounds = new maplibregl.LngLatBounds();
    adventures.forEach((a) => bounds.extend([a.longitude, a.latitude]));
    map.fitBounds(bounds, { padding: 100 });

    return () => {
      if (markerInstancesRef.current.length > 0) {
        markerInstancesRef.current.forEach(m => m.remove());
        markerInstancesRef.current = [];
      }
    };
  }, [adventures, mapRef.current]);

  useEffect(() => {
    const getUniqueCountriesAndAverageRating = async () => {
      const countrySet = new Set<string>();
      let totalRating = 0;

      const geocodingPromises = adventures.map(async (adv) => {
        if (typeof adv.latitude !== 'number' || typeof adv.longitude !== 'number') {
          console.warn(`Invalid coordinates for adventure ${adv.name}:`, adv.latitude, adv.longitude);
          return;
        }
        totalRating += adv.rating || 0;

        try {
          const res = await fetch(
            `https://api.maptiler.com/geocoding/${adv.longitude},${adv.latitude}.json?key=hCWgkMCmHCAFZw9YCnLa`
          );
          const data = await res.json();
          const countryFeature = data.features?.find((feature: any) =>
            feature.place_type?.includes("country")
          );
          if (countryFeature && countryFeature.text) {
            countrySet.add(countryFeature.text);
          } else {
            const highLevelPlace = data.features?.find((feature: any) =>
              ['country', 'region', 'place'].some(type => feature.place_type?.includes(type))
            );
            if (highLevelPlace && highLevelPlace.text) {
                countrySet.add(highLevelPlace.text);
            }
          }
        } catch (error) {
          console.error(`Failed to reverse geocode for adventure ${adv.id} (${adv.name}):`, error);
        }
      });

      await Promise.all(geocodingPromises);
      setVisitedCountries(Array.from(countrySet).sort());

      if (adventures.length > 0) {
        setAverageRating(parseFloat((totalRating / adventures.length).toFixed(1)));
      } else {
        setAverageRating(0);
      }
    };

    if (adventures.length > 0) {
      getUniqueCountriesAndAverageRating();
    } else {
      setVisitedCountries([]);
      setAverageRating(0);
    }
  }, [adventures]);

  return (
    <main className="bg-background text-foreground min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">🌍 Your Adventure Overview</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="text-muted-foreground text-sm">
            <p className="mb-4">Map displaying your visited locations.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Adventures Card */}
              <div className="flex items-center p-4 border rounded-lg bg-secondary/20">
                <Plane className="w-8 h-8 text-primary mr-3" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-primary">{adventures.length}</span>
                  <span className="text-sm text-muted-foreground">Total Adventures</span>
                </div>
              </div>
              {/* Visited Countries Card */}
              <div className="flex items-center p-4 border rounded-lg bg-secondary/20">
                <Globe2 className="w-8 h-8 text-green-600 mr-3" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-green-600">{visitedCountries.length}</span>
                  <span className="text-sm text-muted-foreground">Visited Countries</span>
                </div>
              </div>
              {/* Average Rating Card */}
              <div className="flex items-center p-4 border rounded-lg bg-secondary/20">
                <Star className="w-8 h-8 text-yellow-500 mr-3" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-yellow-500">
                    {averageRating > 0 ? averageRating : "N/A"}
                  </span>
                  <span className="text-sm text-muted-foreground">Average Rating</span>
                </div>
              </div>
            </div>
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