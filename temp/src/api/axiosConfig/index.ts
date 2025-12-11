import axios from 'axios';
import { setupInterceptors } from '../interceptors';
import { env } from '../../config/env';

const BASE_URL = env.VITE_API_BASE_URL;
const PREFIX = '/api/';

const API_TIMEOUT = 60000;

const axiosInstance = axios.create({
  baseURL: BASE_URL + PREFIX,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

setupInterceptors(axiosInstance);

export { axiosInstance };