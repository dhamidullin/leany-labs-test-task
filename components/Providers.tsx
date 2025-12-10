'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { FilterProvider } from '@/contexts/FilterContext';
import { MapDataProvider } from '@/contexts/MapDataContext';
import { PopupProvider } from '@/contexts/PopupContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <MapDataProvider>
          <PopupProvider>
            {children}
          </PopupProvider>
        </MapDataProvider>
      </FilterProvider>
    </QueryClientProvider>
  );
}
