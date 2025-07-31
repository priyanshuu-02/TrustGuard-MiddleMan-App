import axios from 'axios';
const isLocalhost = window.location.hostname === 'localhost';

const instance = axios.create({
  baseURL: isLocalhost
    ? 'http://localhost:5000/api'
    : 'https://trustguard-rqgf.onrender.com/api',
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