import express from 'express';
import cors from 'cors';
import { NormalizedWeatherEntry, WeatherTypes } from '@repo/types';
import { fetchWeatherData } from './services/weatherService';

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

app.get('/geojson', async (req, res) => {
  try {
    const normalized = await fetchWeatherData();

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

    const features = filtered.map(item => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [(item.coords || []).map(c => [c.lon, c.lat])]
      },
      properties: item
    }));

    res.json({
      type: 'FeatureCollection',
      features
    });
  } catch (error) {
    console.error('Error fetching geojson data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
