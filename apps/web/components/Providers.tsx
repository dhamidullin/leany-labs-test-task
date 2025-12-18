'use client';

import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { useState } from 'react';
import { FilterProvider } from '@/contexts/FilterContext';
import { PopupProvider } from '@/contexts/PopupContext';
import { toast } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error('Failed to fetch data. Please try again later.');
        console.error(error);
      },
    }),
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <PopupProvider>
          {children}
        </PopupProvider>
      </FilterProvider>
    </QueryClientProvider>
  );
}
