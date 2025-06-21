import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('🔧 API client initialized - token refresh removed!');

// Interceptor for å legge til token i headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Removed token refresh logic - not needed for this implementation

// Interceptor for å håndtere feil
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('🚨 API Error interceptor (NEW VERSION):', error.config?.url, error.response?.status);
    
    // Hvis det er 401 feil (unauthorized), logg ut brukeren
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('bruker');
      window.location.href = '/logg-inn';
    }
    
    return Promise.reject(error);
  }
);

export default api; 