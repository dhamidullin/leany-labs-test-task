'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { IsigmetEntry, AirSigmetEntry } from '@repo/types';

type PopupData = {
  data: IsigmetEntry | AirSigmetEntry;
  lng: number;
  lat: number;
  type: 'SIGMET' | 'AIRSIGMET';
} | null;

interface PopupContextType {
  popupData: PopupData;
  setPopupData: (data: PopupData) => void;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popupData, setPopupData] = useState<PopupData>(null);

  const closePopup = () => setPopupData(null);

  return (
    <PopupContext.Provider value={{ popupData, setPopupData, closePopup }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}
