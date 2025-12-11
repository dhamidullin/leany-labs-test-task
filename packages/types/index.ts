export interface IsigmetEntry {
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

export interface AirSigmetEntry {
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

export const WeatherTypes = {
  ISIGMET: 'ISIGMET',
  AIRSIGMET: 'AIRSIGMET',
} as const;

export type WeatherType = (typeof WeatherTypes)[keyof typeof WeatherTypes];

interface BaseWeatherEntry {
  id: string; // composite id

  // Common fields
  icaoId: string;
  seriesId: string;
  hazard: string;
  receiptTime: string;
  validTimeFrom: number;
  validTimeTo: number;

  // Geometry
  coords: {
    lat: number;
    lon: number;
  }[];

  // Altitude / Vertical extent
  base: number | null; // min altitude
  top: number | null; // max altitude

  // Movement
  movementDir: string | null;
  movementSpd: string | number | null; // Unified to handle both types safely

  // Raw Data
  rawText: string;
}

export type NormalizedWeatherEntry = BaseWeatherEntry & ({
  type: typeof WeatherTypes.ISIGMET;
  qualifier: string; // Isigmet specific
} | {
  type: typeof WeatherTypes.AIRSIGMET;
  severity: number; // AirSigmet specific
});
