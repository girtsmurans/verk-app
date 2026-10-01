"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __verkGoogleMapsLoaded?: boolean;
    initVerkMap?: () => void;
  }
}

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initVerkMap`;
    script.async = true;
    window.initVerkMap = () => resolve();
    document.head.appendChild(script);
  });
}

export function MapPicker({
  onChange,
  initialLat = 56.9496,
  initialLng = 24.1052,
}: {
  onChange: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let marker: google.maps.Marker;

    loadGoogleMaps().then(() => {
      if (!mapRef.current) return;
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 12,
        mapId: "VERK_MAP",
      });

      marker = new google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map,
        draggable: true,
      });

      const updateFromLatLng = (lat: number, lng: number) => {
        onChange(lat, lng);
      };

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) updateFromLatLng(pos.lat(), pos.lng());
      });

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        marker.setPosition(e.latLng);
        updateFromLatLng(e.latLng.lat(), e.latLng.lng());
      });

      setReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      onChange(pos.coords.latitude, pos.coords.longitude);
    });
  }

  return (
    <div>
      <div
        ref={mapRef}
        className="h-64 w-full rounded-lg border border-neutral-200"
      />
      <button
        type="button"
        onClick={useMyLocation}
        className="mt-2 text-sm text-neutral-500 hover:text-neutral-900"
      >
        Izmantot manu pašreizējo atrašanās vietu
      </button>
      {!ready && (
        <p className="mt-1 text-xs text-neutral-400">Karte ielādējas...</p>
      )}
    </div>
  );
}
