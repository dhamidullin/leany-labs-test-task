'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useFilter } from './FilterContext';
import { useWeatherData } from '@/hooks/queries';
import { IsigmetEntry, AirSigmetEntry } from '@repo/types';

interface MapDataContextType {
  isigmets: IsigmetEntry[];
  airSigmets: AirSigmetEntry[];
}

const MapDataContext = createContext<MapDataContextType | undefined>(undefined);

const isInRange = (from: number, to: number, value: number) => {
  const start = from;
  const end = to;
  return value >= start && value <= end;
};

const checkIsigmetAltitude = (entry: IsigmetEntry, range: number[]) => {
  const entryBase = entry.base ?? -Infinity;
  const entryTop = entry.top ?? Infinity;
  return entryBase <= range[1] && entryTop >= range[0];
};

const checkAirSigmetAltitude = ( entry: AirSigmetEntry, range: number[]) => {
  const low1 = entry.altitudeLow1 ?? -Infinity;
  const hi1 = entry.altitudeHi1 ?? Infinity;
  const overlaps1 = low1 <= range[1] && hi1 >= range[0];

  let overlaps2 = false;
  if (entry.altitudeLow2 !== null || entry.altitudeHi2 !== null) {
    const low2 = entry.altitudeLow2 ?? -Infinity;
    const hi2 = entry.altitudeHi2 ?? Infinity;
    overlaps2 = low2 <= range[1] && hi2 >= range[0];
  }

  return overlaps1 || overlaps2;
};

export function MapDataProvider({ children }: { children: ReactNode }) {
  const {
    sigmet: showSigmet,
    airsigmet: showAirsigmet,
    altitudeRange,
    timeFilter
  } = useFilter();

  const { data: weatherData } = useWeatherData();

  const isigmets = useMemo(() => {
    const entries = weatherData?.isigmets || [];
    if (!showSigmet) return [];

    return entries
      .filter((entry) => checkIsigmetAltitude(entry, altitudeRange))
      .filter(entry => isInRange(entry.validTimeFrom * 1000, entry.validTimeTo * 1000, timeFilter));
  }, [weatherData?.isigmets, showSigmet, altitudeRange, timeFilter]);

  const airSigmets = useMemo(() => {
    const entries = weatherData?.airSigmets || [];
    if (!showAirsigmet) return [];

    return entries
      .filter((entry) => checkAirSigmetAltitude(entry, altitudeRange))
      .filter(entry => isInRange(entry.validTimeFrom * 1000, entry.validTimeTo * 1000, timeFilter));
  }, [weatherData?.airSigmets, showAirsigmet, altitudeRange, timeFilter]);

  const value: MapDataContextType = {
    isigmets,
    airSigmets
  };

  return (
    <MapDataContext.Provider value={value}>
      {children}
    </MapDataContext.Provider>
  );
}

export function useMapData() {
  const context = useContext(MapDataContext);
  if (context === undefined) {
    throw new Error('useMapData must be used within a MapDataProvider');
  }
  return context;
}
