import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getWeatherData: async (params: {} /* add query params */) => {
    const response = await apiClient.get('/sigmets', { params });
    return response.data;
  },
};

export default apiClient;

