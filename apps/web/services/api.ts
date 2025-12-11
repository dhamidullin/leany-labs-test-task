import axios from 'axios';
import { NormalizedWeatherEntry } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface WeatherDataParams {
  sigmet?: boolean;
  airsigmet?: boolean;
  minAlt?: number;
  maxAlt?: number;
  date?: string;
}

export const api = {
  getWeatherData: async (params: WeatherDataParams = {}) => {
    const response = await apiClient.get<{ normalized: NormalizedWeatherEntry[] }>('/sigmets', { params });
    return response.data;
  },
};

export default apiClient;

