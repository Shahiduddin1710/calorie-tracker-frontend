import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
})

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
