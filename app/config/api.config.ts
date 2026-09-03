// API config
import axios from 'axios';

export const API_BASE_URL = '/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});
