import { useQuery } from '@tanstack/react-query';
import { IsigmetEntry, AirSigmetEntry } from '@repo/types';

export interface WeatherData {
  isigmets: IsigmetEntry[];
  airSigmets: AirSigmetEntry[];
}

const fetchWeatherData = async (): Promise<WeatherData> => {
  const response = await fetch('/api/weather');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useWeatherData = () => {
  return useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeatherData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

