import { NextResponse } from 'next/server';
import axios from 'axios';
import { IsigmetEntry, AirSigmetEntry } from '@repo/types';

export async function GET() {
  try {
    const [isigmetRes, airSigmetRes] = await Promise.all([
      axios.get<IsigmetEntry[]>('https://aviationweather.gov/api/data/isigmet?format=json'),
      axios.get<AirSigmetEntry[]>('https://aviationweather.gov/api/data/airsigmet?format=json')
    ]);

    return NextResponse.json({ 
      isigmets: isigmetRes.data, 
      airSigmets: airSigmetRes.data 
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
