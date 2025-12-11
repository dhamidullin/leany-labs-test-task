'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useFilter } from './FilterContext';
import { useWeatherData } from '@/hooks/queries';
import { NormalizedWeatherEntry } from '@repo/types';

interface MapDataContextType {
  sigmets: NormalizedWeatherEntry[];
}

const MapDataContext = createContext<MapDataContextType | undefined>(undefined);

export function MapDataProvider({ children }: { children: ReactNode }) {
  const {
    sigmet: showSigmet,
    airsigmet: showAirsigmet,
    altitudeRange,
    timeFilter
  } = useFilter();

  const { data: weatherData } = useWeatherData({
    sigmet: showSigmet,
    airsigmet: showAirsigmet,
    minAlt: altitudeRange[0],
    maxAlt: altitudeRange[1],
    date: new Date(timeFilter).toISOString(),
  });

  const value: MapDataContextType = {
    sigmets: weatherData?.normalized || []
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
