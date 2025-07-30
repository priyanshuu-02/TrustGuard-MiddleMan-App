// client/src/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.MODE === 'development'
    ? 'http://localhost:10000/api'
    : 'https://trustguard-rqgf.onrender.com/api', // Change this to your actual backend URL
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// 👇 Auto logout on 401
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default instance;
