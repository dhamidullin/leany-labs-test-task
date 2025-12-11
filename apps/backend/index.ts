import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { IsigmetEntry, AirSigmetEntry, NormalizedWeatherEntry, WeatherTypes } from '@repo/types';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Aviation Weather Center Proxy API');
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/sigmets', async (req, res) => {
  try {
    const [isigmetRes, airSigmetRes] = await Promise.all([
      axios.get<IsigmetEntry[]>('https://aviationweather.gov/api/data/isigmet?format=json'),
      axios.get<AirSigmetEntry[]>('https://aviationweather.gov/api/data/airsigmet?format=json')
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
        base: item.altitudeLow1, // Map low altitude to base
        top: item.altitudeHi1,   // Map high altitude to top
        movementDir: item.movementDir,
        movementSpd: item.movementSpd,
        rawText: item.rawAirSigmet,

        severity: item.severity
      }))
    ];

    const { sigmet, airsigmet, minAlt, maxAlt, date } = req.query;

    const showSigmet = sigmet === 'true';
    const showAirSigmet = airsigmet === 'true';
    const filterMinAlt = minAlt ? parseFloat(minAlt as string) : null;
    const filterMaxAlt = maxAlt ? parseFloat(maxAlt as string) : null;
    const filterDate = date ? new Date(date as string).getTime() / 1000 : null;

    const filtered = normalized.filter(item => {
      if (item.type === WeatherTypes.ISIGMET && !showSigmet) return false;
      if (item.type === WeatherTypes.AIRSIGMET && !showAirSigmet) return false;

      const itemBase = item.base ?? 0;
      const itemTop = item.top ?? Infinity;

      if (filterMinAlt !== null && itemTop < filterMinAlt) return false;
      if (filterMaxAlt !== null && itemBase > filterMaxAlt) return false;

      if (filterDate !== null && !isNaN(filterDate)) {
        if (filterDate < item.validTimeFrom || filterDate > item.validTimeTo) return false;
      }

      return true;
    });

    res.json({
      normalized: filtered,
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
