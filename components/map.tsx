'use client'

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapData } from '@/contexts/MapDataContext';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { isigmets, airSigmets } = useMapData();

  useEffect(() => {
    if (map.current) return; // stops map from initializing more than once

    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
            }
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [0, 0],
        zoom: 1
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    }

    return () => {
      if (map.current) {
          map.current.remove();
          map.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;

    // Handle AirSigmets
    if (mapInstance.getSource('airsigmets')) {
      const source = mapInstance.getSource('airsigmets') as maplibregl.GeoJSONSource;
      source.setData({
        type: 'FeatureCollection',
        features: airSigmets.map((sigmet) => ({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [sigmet.coords.map((coord) => [coord.lon, coord.lat])],
          },
          properties: sigmet,
        })),
      });
    } else {
      mapInstance.addSource('airsigmets', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: airSigmets.map((sigmet) => ({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [sigmet.coords.map((coord) => [coord.lon, coord.lat])],
            },
            properties: sigmet,
          })),
        },
      });

      mapInstance.addLayer({
        id: 'airsigmets-fill',
        type: 'fill',
        source: 'airsigmets',
        paint: {
          'fill-color': '#88CCEE',
          'fill-opacity': 0.4,
        },
      });

      mapInstance.addLayer({
        id: 'airsigmets-outline',
        type: 'line',
        source: 'airsigmets',
        paint: {
          'line-color': '#0000FF',
          'line-width': 2,
        },
      });
    }

    // Handle Isigmets
    if (mapInstance.getSource('isigmets')) {
      const source = mapInstance.getSource('isigmets') as maplibregl.GeoJSONSource;
      source.setData({
        type: 'FeatureCollection',
        features: isigmets.map((sigmet) => ({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [sigmet.coords.map((coord) => [coord.lon, coord.lat])],
          },
          properties: sigmet,
        })),
      });
    } else {
      mapInstance.addSource('isigmets', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: isigmets.map((sigmet) => ({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [sigmet.coords.map((coord) => [coord.lon, coord.lat])],
            },
            properties: sigmet,
          })),
        },
      });

      mapInstance.addLayer({
        id: 'isigmets-fill',
        type: 'fill',
        source: 'isigmets',
        paint: {
          'fill-color': '#EE8888',
          'fill-opacity': 0.4,
        },
      });

      mapInstance.addLayer({
        id: 'isigmets-outline',
        type: 'line',
        source: 'isigmets',
        paint: {
          'line-color': '#FF0000',
          'line-width': 2,
        },
      });
    }

  }, [isigmets, airSigmets, mapLoaded]);

  return <div className="w-full h-screen" ref={mapContainer} />;
}
