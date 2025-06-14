"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface AdventureMapProps {
  coordinates: [number, number]; // [lng, lat]
}

export default function AdventureMap({ coordinates }: AdventureMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: "https://api.maptiler.com/maps/streets/style.json?key=hCWgkMCmHCAFZw9YCnLa",
      center: coordinates,
      zoom: 12,
      interactive: false, // make it read-only
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    new maplibregl.Marker().setLngLat(coordinates).addTo(map);

    mapInstanceRef.current = map;

    return () => map.remove();
  }, [coordinates]);

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-2xl border mb-2"
    />
  );
}
