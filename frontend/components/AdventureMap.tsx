"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface AdventureMapProps {
  coordinates: [number, number];
  onMapClick?: (lngLat: [number, number]) => void;
  isEditable?: boolean;
}

interface MapTilerFeature {
  id: string;
  place_name: string;
  geometry: {
    coordinates: [number, number];
  };
}

export default function AdventureMap({ coordinates, onMapClick, isEditable }: AdventureMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<MapTilerFeature[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: coordinates,
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const marker = new maplibregl.Marker().setLngLat(coordinates).addTo(map);
    markerRef.current = marker;
    mapInstanceRef.current = map;

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(mapRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [coordinates]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markerRef.current) return;

    const clickHandler = (e: maplibregl.MapMouseEvent) => {
      if (isEditable && onMapClick) {
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        markerRef.current?.setLngLat(lngLat);
        onMapClick(lngLat);
      }
    };

    if (isEditable) {
      map.on("click", clickHandler);
      map.getCanvas().style.cursor = "crosshair";
    } else {
      map.off("click", clickHandler);
      map.getCanvas().style.cursor = "";
    }

    return () => {
      map.off("click", clickHandler);
      map.getCanvas().style.cursor = "";
    };
  }, [isEditable, onMapClick]);

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setCenter(coordinates);
      markerRef.current.setLngLat(coordinates);
    }
  }, [coordinates]);

  // Fetch geocoding results
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(searchTerm)}.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
        );
        const data = await res.json();
        setResults((data.features || []) as MapTilerFeature[]);
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSelectLocation = (lng: number, lat: number, placeName: string) => {
    if (mapInstanceRef.current && markerRef.current) {
      const coords: [number, number] = [lng, lat];
      mapInstanceRef.current.setCenter(coords);
      markerRef.current.setLngLat(coords);
      onMapClick?.(coords);
      setSearchTerm(placeName);
      setResults([]);
    }
  };

  return (
    <div className="w-full">
      {isEditable && (
        <div className="mb-2 relative">
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Search for a place..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {results.length > 0 && (
            <ul className="absolute bg-background border rounded-lg w-full max-h-40 overflow-auto z-10">
              {results.map((place) => (
                <li
                  key={place.id}
                  className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() =>
                    handleSelectLocation(
                      place.geometry.coordinates[0],
                      place.geometry.coordinates[1],
                      place.place_name
                    )
                  }
                >
                  {place.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div ref={mapRef} className="w-full h-64 rounded-1xl border" />
    </div>
  );
}
