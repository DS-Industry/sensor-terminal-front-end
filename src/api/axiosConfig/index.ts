import axios from 'axios';
import { setupInterceptors } from '../interceptors';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const PREFIX = '/api/';

const axiosInstance = axios.create({
  baseURL: BASE_URL + PREFIX,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(axiosInstance);

export { axiosInstance };