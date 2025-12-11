'use client'

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapData } from '@/contexts/MapDataContext';
import { usePopup } from '@/contexts/PopupContext';
import center from '@turf/center';

import MapPopup from './MapPopup';

import { WeatherTypes } from '@repo/types';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { sigmets: allSigmets } = useMapData();
  const { setPopupData } = usePopup();

  // Split data for rendering
  const isigmets = allSigmets.filter(s => s.type === WeatherTypes.ISIGMET);
  const airSigmets = allSigmets.filter(s => s.type === WeatherTypes.AIRSIGMET);


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
      
      mapInstance.on('mouseenter', 'airsigmets-fill', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });
      mapInstance.on('mouseleave', 'airsigmets-fill', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
      mapInstance.on('click', 'airsigmets-fill', (e) => {
        if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            
            // Calculate center using turf
            const centerPoint = center(feature as any);
            const [lng, lat] = centerPoint.geometry.coordinates;
            
            setPopupData({
                data: feature.properties as any,
                lng,
                lat,
                type: 'AIRSIGMET'
            });
        }
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

      // Re-bind events for isigmets
      mapInstance.on('mouseenter', 'isigmets-fill', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });
      mapInstance.on('mouseleave', 'isigmets-fill', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
      mapInstance.on('click', 'isigmets-fill', (e) => {
        if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            
            // Calculate center using turf
            const centerPoint = center(feature as any);
            const [lng, lat] = centerPoint.geometry.coordinates;

            setPopupData({
                data: feature.properties as any,
                lng,
                lat,
                type: 'SIGMET'
            });
        }
      });
    }

  }, [isigmets, airSigmets, mapLoaded]);

  return (
    <div className="w-full h-screen" ref={mapContainer}>
      {map.current && <MapPopup map={map.current} />}
    </div>
  );
}
