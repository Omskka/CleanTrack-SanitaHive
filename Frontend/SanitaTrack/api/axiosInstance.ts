import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://10.0.2.2:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // for mobile
});

export default axiosInstance;