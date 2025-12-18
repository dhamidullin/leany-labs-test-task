import axios from 'axios';
import { IsigmetEntry, AirSigmetEntry, NormalizedWeatherEntry, WeatherTypes } from '@repo/types';
import { InMemoryCache } from '../cache/InMemoryCache';
import { ICache } from '../cache/ICache';
import ms from 'ms';

const ISIGMET_API_URL = 'https://aviationweather.gov/api/data/isigmet?format=json';
const AIRSIGMET_API_URL = 'https://aviationweather.gov/api/data/airsigmet?format=json';

const CACHE_KEY = 'weather_data';
const CACHE_TTL = ms('1h') / 1000; // 1 hour in seconds

// Use the interface for the variable type to allow easy swapping
const cache: ICache = new InMemoryCache();

export const fetchWeatherData = async (): Promise<NormalizedWeatherEntry[]> => {
  const cachedData = await cache.get<NormalizedWeatherEntry[]>(CACHE_KEY);

  if (cachedData) {
    return cachedData;
  }

  const [isigmetRes, airSigmetRes] = await Promise.all([
    axios.get<IsigmetEntry[]>(ISIGMET_API_URL),
    axios.get<AirSigmetEntry[]>(AIRSIGMET_API_URL)
  ]);

  const normalized: NormalizedWeatherEntry[] = [
    ...isigmetRes.data.map(item => ({
      id: `isigmet-${item.firId}-${item.seriesId}-${item.validTimeFrom}`,
      type: WeatherTypes.ISIGMET,
      icaoId: item.icaoId,
      seriesId: item.seriesId,
      hazard: item.hazard,
      receiptTime: item.receiptTime,
      validTimeFrom: item.validTimeFrom,
      validTimeTo: item.validTimeTo,
      coords: item.coords,
      base: item.base,
      top: item.top,
      movementDir: item.dir,
      movementSpd: item.spd,
      rawText: item.rawSigmet,
      qualifier: item.qualifier
    })),
    ...airSigmetRes.data.map(item => ({
      id: `airsigmet-${item.icaoId}-${item.seriesId}-${item.validTimeFrom}`,
      type: WeatherTypes.AIRSIGMET,
      icaoId: item.icaoId,
      seriesId: item.seriesId,
      hazard: item.hazard,
      receiptTime: item.receiptTime,
      validTimeFrom: item.validTimeFrom,
      validTimeTo: item.validTimeTo,
      coords: item.coords,
      base: item.altitudeLow1,
      top: item.altitudeHi1,  
      movementDir: item.movementDir,
      movementSpd: item.movementSpd,
      rawText: item.rawAirSigmet,
      severity: item.severity
    }))
  ];

  await cache.set(CACHE_KEY, normalized, CACHE_TTL);

  return normalized;
};
