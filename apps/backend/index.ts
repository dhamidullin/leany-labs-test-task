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

    res.json({
      normalized,
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
