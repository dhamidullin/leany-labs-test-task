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

