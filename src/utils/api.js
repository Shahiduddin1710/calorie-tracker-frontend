import axios from 'axios'

const api = axios.create({
  baseURL: 'https://calorietracker-backend.vercel.app/api',
  timeout: 15000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ct_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ct_token')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)

export default api