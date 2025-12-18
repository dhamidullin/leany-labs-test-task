'use client'

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { usePopup } from '@/contexts/PopupContext';
import { useFilter } from '@/contexts/FilterContext';
import center from '@turf/center';

import MapPopup from './MapPopup';
import Loader from './Loader';
import { API_URL } from '@/services/api';
import { NormalizedWeatherEntry } from '@repo/types';

const useWeatherMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false); // Track internal map loading state

  const { setPopupData } = usePopup();

  const {
    sigmet,
    airsigmet,
    altitudeRange,
    timeFilter
  } = useFilter();

  // Construct the GeoJSON URL with current filters
  const queryParams = new URLSearchParams({
    sigmet: String(sigmet),
    airsigmet: String(airsigmet),
    minAlt: String(altitudeRange[0]),
    maxAlt: String(altitudeRange[1]),
    date: new Date(timeFilter).toISOString(),
  });

  const dataUrl = `${API_URL}/geojson?${queryParams.toString()}`;

  useEffect(() => {
    if (map.current) return;

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

      // Loading state handlers
      map.current.on('dataloading', (e: { sourceId?: 'weather-data', isSourceLoaded?: boolean }) => {
        if (e.sourceId === 'weather-data') {
          setIsMapLoading(true);
        }
      });

      map.current.on('data', (e: { sourceId?: 'weather-data', isSourceLoaded?: boolean }) => {
        if (e.sourceId === 'weather-data' && e.isSourceLoaded === true) {
          setIsMapLoading(false);
        }
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setIsMapLoading(false);
      });
    }

    return () => {
      // NOTE: remove() removes map's DOM elements and all event listners
      // so no additional cleanup is needed (addressing the feedback)
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;
    const sourceId = 'weather-data';

    if (mapInstance.getSource(sourceId)) {
      const source = mapInstance.getSource(sourceId) as maplibregl.GeoJSONSource;
      source.setData(dataUrl);
    } else {
      mapInstance.addSource(sourceId, {
        type: 'geojson',
        data: dataUrl,
      });

      // AIRSIGMET Layers
      mapInstance.addLayer({
        id: 'airsigmets-fill',
        type: 'fill',
        source: sourceId,
        filter: ['==', 'type', 'AIRSIGMET'],
        paint: {
          'fill-color': '#88CCEE',
          'fill-opacity': 0.4,
        },
      });

      mapInstance.addLayer({
        id: 'airsigmets-outline',
        type: 'line',
        source: sourceId,
        filter: ['==', 'type', 'AIRSIGMET'],
        paint: {
          'line-color': '#0000FF',
          'line-width': 2,
        },
      });

      // ISIGMET Layers
      mapInstance.addLayer({
        id: 'isigmets-fill',
        type: 'fill',
        source: sourceId,
        filter: ['==', 'type', 'ISIGMET'],
        paint: {
          'fill-color': '#EE8888',
          'fill-opacity': 0.4,
        },
      });

      mapInstance.addLayer({
        id: 'isigmets-outline',
        type: 'line',
        source: sourceId,
        filter: ['==', 'type', 'ISIGMET'],
        paint: {
          'line-color': '#FF0000',
          'line-width': 2,
        },
      });

      // Interactions
      const layers = ['airsigmets-fill', 'isigmets-fill'];

      layers.forEach(layer => {
        // handle mouse enter and leave to show pointer cursor over clickable areas
        mapInstance.on('mouseenter', layer, () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });
        mapInstance.on('mouseleave', layer, () => {
          mapInstance.getCanvas().style.cursor = '';
        });

        // handle click on layer to show popup
        mapInstance.on('click', layer, (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];

            // Calculate center using turf
            const centerPoint = center(feature);
            const [lng, lat] = centerPoint.geometry.coordinates;

            setPopupData({
              data: feature.properties as NormalizedWeatherEntry,
              lng,
              lat,
              type: feature.properties?.type === 'ISIGMET' ? 'SIGMET' : 'AIRSIGMET'
            });
          }
        });
      });
    }
  }, [dataUrl, mapLoaded, setPopupData]);

  return { mapContainer, mapLoaded, isMapLoading, map }
}

export default function Map() {
  const { mapContainer, mapLoaded, isMapLoading, map } = useWeatherMap();

  return (
    <div className="relative w-full h-screen" ref={mapContainer}>
      {(!mapLoaded || isMapLoading) && <Loader />}
      {map.current && <MapPopup map={map.current} />}
    </div>
  );
}
