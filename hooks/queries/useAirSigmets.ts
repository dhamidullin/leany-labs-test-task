import { useQuery } from '@tanstack/react-query';

export interface AirSigmet {
  icaoId: string;
  alphaChar: string;
  seriesId: string;
  receiptTime: string;
  creationTime: string;
  validTimeFrom: number;
  validTimeTo: number;
  airSigmetType: string;
  hazard: string;
  altitudeHi1: number | null;
  altitudeHi2: number | null;
  altitudeLow1: number | null;
  altitudeLow2: number | null;
  movementDir: string | null;
  movementSpd: number | null;
  rawAirSigmet: string;
  postProcessFlag: number;
  severity: number;
  coords: {
    lat: number;
    lon: number;
  }[];
}

const fetchAirSigmets = async (): Promise<AirSigmet[]> => {
  const response = await fetch('https://aviationweather.gov/api/data/airsigmet?format=json');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useAirSigmets = () => {
  return useQuery({
    queryKey: ['airsigmets'],
    queryFn: fetchAirSigmets,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
