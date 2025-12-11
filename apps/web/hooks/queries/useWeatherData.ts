import { useQuery } from '@tanstack/react-query';
import { NormalizedWeatherEntry } from '@repo/types';
import { api, WeatherDataParams } from '@/services/api';

export interface WeatherData {
  normalized: NormalizedWeatherEntry[];
}

export const useWeatherData = (params?: WeatherDataParams) => {
  return useQuery({
    queryKey: ['weather', params],
    queryFn: () => api.getWeatherData(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

