'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  sigmet: boolean;
  setSigmet: (value: boolean) => void;

  airsigmet: boolean;
  setAirsigmet: (value: boolean) => void;

  altitudeRange: number[];
  setAltitudeRange: (value: number[]) => void;

  timeFilter: number;
  setTimeFilter: (value: number) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [sigmet, setSigmet] = useState(true);
  const [airsigmet, setAirsigmet] = useState(true);
  const [altitudeRange, setAltitudeRange] = useState<number[]>([0, 48000]);
  const [timeFilter, setTimeFilter] = useState<number>(new Date().setSeconds(0, 0)); // TODO: create utils functions for get start of the minute

  const value: FilterContextType = {
    sigmet, setSigmet, 
    airsigmet, setAirsigmet,
    altitudeRange, setAltitudeRange,
    timeFilter, setTimeFilter,
  }

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);

  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }

  return context;
}
