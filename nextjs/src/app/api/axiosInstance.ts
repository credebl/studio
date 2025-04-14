// import axios from 'axios'

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//   withCredentials: true // optional, only if you're using cookies
// })

// // Request interceptor to add token
// api.interceptors.request.use(
//   async config => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('authToken') // or use cookies or secure storage

//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//       }
//     }
//     return config
//   },
//   error => Promise.reject(error)
// )

// // Response interceptor for error handling
// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response?.status === 401) {
//       // Optional: redirect to login or clear token
//       console.error('Unauthorized, logging out…')
//       localStorage.removeItem('authToken')
//       window.location.href = '/login' // or trigger modal/session expired
//     }

//     return Promise.reject(error?.response?.data || error)
//   }
// )

// export default api
