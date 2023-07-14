import axios from 'axios'
const instance = axios.create({
    baseURL: import.meta.env.PUBLIC_BASE_URL ?? process.env.PUBLIC_BASE_URL
})

export default instance