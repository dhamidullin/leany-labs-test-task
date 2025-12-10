import { useQuery } from '@tanstack/react-query';

export interface Isigmet {
  icaoId: string;
  firId: string;
  firName: string;
  receiptTime: string;
  validTimeFrom: number;
  validTimeTo: number;
  seriesId: string;
  hazard: string;
  qualifier: string;
  base: number | null;
  top: number | null;
  geom: string;
  coords: {
    lat: number;
    lon: number;
  }[];
  dir: string | null;
  spd: string | null;
  chng: string | null;
  rawSigmet: string;
}

const fetchIsigmets = async (): Promise<Isigmet[]> => {
  const response = await fetch('https://aviationweather.gov/api/data/isigmet?format=json');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useIsigmets = () => {
  return useQuery({
    queryKey: ['isigmets'],
    queryFn: fetchIsigmets,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
