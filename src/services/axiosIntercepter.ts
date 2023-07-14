import axios from 'axios'
const instance = axios.create({
    baseURL: import.meta.env.PUBLIC_BASE_URL || import.meta.env.MYURL
})

export default instance