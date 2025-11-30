import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
})

export const authAPI = {
  signup: async (username, email, password, passwordConfirm) => {
    const response = await api.post('/auth/signup', {
      username,
      email,
      password,
      passwordConfirm,
    })
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  logout: async () => {
    const response = await api.get('/auth/logout')
    return response.data
  },

  updatePassword: async (passwordCurrent, password, passwordConfirm) => {
    const response = await api.patch('/auth/updateMyPassword', {
      passwordCurrent,
      password,
      passwordConfirm,
    })
    return response.data
  },
}

export default api
