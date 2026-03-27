import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://calorietracker-backend.vercel.app/api',
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

export const activityAPI = {
  getByDate: (date) => api.get(`/activity/date/${date}`),
  getWeeklyStats: (startDate) => api.get(`/activity/stats/weekly?startDate=${startDate}`),
  add: (data) => api.post('/activity', data),
  delete: (id) => api.delete(`/activity/${id}`)
}

export default api