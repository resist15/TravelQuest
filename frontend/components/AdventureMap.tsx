"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface AdventureMapProps {
  coordinates: [number, number]; // [lng, lat]
  onMapClick?: (lngLat: [number, number]) => void;
  isEditable?: boolean; // New prop to control editability
}

export default function AdventureMap({ coordinates, onMapClick, isEditable }: AdventureMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: coordinates,
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Set initial marker
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
  }, []); // Empty dependency array means this effect runs once on mount

  // Effect for handling map click events based on isEditable
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markerRef.current) return;

    const clickHandler = (e: maplibregl.MapMouseEvent) => {
      if (isEditable && onMapClick) {
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        markerRef.current?.setLngLat(lngLat); // Move marker
        onMapClick(lngLat); // Send new coordinates to parent
      }
    };

    if (isEditable) {
      map.on("click", clickHandler);
      map.getCanvas().style.cursor = 'crosshair'; // Change cursor to indicate clickability
    } else {
      map.off("click", clickHandler); // Remove click listener if not editable
      map.getCanvas().style.cursor = ''; // Reset cursor
    }

    // Cleanup function for this effect
    return () => {
      map.off("click", clickHandler);
      map.getCanvas().style.cursor = ''; // Ensure cursor is reset on unmount or mode change
    };
  }, [isEditable, onMapClick]); // Re-run this effect when isEditable or onMapClick changes

  // If coordinates change, re-center and move marker
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setCenter(coordinates);
      markerRef.current.setLngLat(coordinates);
    }
  }, [coordinates]);

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-1xl border"
    />
  );
}