import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL as string

export const api = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	withCredentials: false,
})

// Attach JWT token if present
api.interceptors.request.use(config => {
	const token = localStorage.getItem('jwt')
	if (token) {
		config.headers = config.headers ?? {}
		config.headers['Authorization'] = `Bearer ${token}`
	}
	return config
})

export default api
