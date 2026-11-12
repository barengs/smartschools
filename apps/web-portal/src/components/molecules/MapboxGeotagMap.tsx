/// <reference types="vite/client" />
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxGeotagMapProps {
  schoolLat: number;
  schoolLng: number;
  studentLat: number | null;
  studentLng: number | null;
  onSelectLocation: (lat: string, lng: string) => void;
}

const FALLBACK_OSM_STYLE: mapboxgl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function MapboxGeotagMap({
  schoolLat,
  schoolLng,
  studentLat,
  studentLng,
  onSelectLocation,
}: MapboxGeotagMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const studentMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
    if (token) {
      mapboxgl.accessToken = token;
    }

    const centerLng = studentLng ?? schoolLng;
    const centerLat = studentLat ?? schoolLat;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: token ? 'mapbox://styles/mapbox/streets-v12' : FALLBACK_OSM_STYLE,
      center: [centerLng, centerLat],
      zoom: 15,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // School gate fixed reference marker
    new mapboxgl.Marker({ color: '#0d6efd' })
      .setLngLat([schoolLng, schoolLat])
      .setPopup(
        new mapboxgl.Popup({ offset: 20 }).setHTML(
          '<div style="font-size:12px;font-weight:600">Gerbang SMA Nusantara Unggul</div>',
        ),
      )
      .addTo(map);

    map.on('click', (e) => {
      onSelectLocation(e.lngLat.lat.toFixed(6), e.lngLat.lng.toFixed(6));
    });

    mapRef.current = map;

    return () => {
      studentMarkerRef.current?.remove();
      studentMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [schoolLat, schoolLng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (studentLat !== null && studentLng !== null) {
      if (!studentMarkerRef.current) {
        const marker = new mapboxgl.Marker({ color: '#198754', draggable: true })
          .setLngLat([studentLng, studentLat])
          .setPopup(
            new mapboxgl.Popup({ offset: 20 }).setHTML(
              '<div style="font-size:12px;font-weight:600">Lokasi Rumah Calon Siswa</div>',
            ),
          )
          .addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLngLat();
          onSelectLocation(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });

        studentMarkerRef.current = marker;
      } else {
        studentMarkerRef.current.setLngLat([studentLng, studentLat]);
      }

      map.flyTo({ center: [studentLng, studentLat], zoom: 15, essential: true });
    } else if (studentMarkerRef.current) {
      studentMarkerRef.current.remove();
      studentMarkerRef.current = null;
    }
  }, [studentLat, studentLng, onSelectLocation]);

  return (
    <div className="relative w-full h-72 sm:h-80 rounded border border-[#dee2e6] overflow-hidden bg-[#e9ecef]">
      <div ref={containerRef} className="w-full h-full" />
      <div className="pointer-events-none absolute top-2.5 left-2.5 rounded border border-[#dee2e6] bg-white/95 px-2.5 py-1.5 text-xs shadow-2xs">
        <div className="font-semibold text-[#212529]">Peta Zonasi Mapbox</div>
        <div className="text-[#6c757d]">Klik pada peta atau geser pin hijau untuk menentukan titik rumah</div>
      </div>
    </div>
  );
}
