import axios from 'axios';
import { auth } from './firebase';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error?.response?.data?.error?.message || error.message || 'Something went wrong';
    if (error?.response?.status === 401) {
      toast.error('Your session expired. Please sign in again.');
      auth.signOut();
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;
