import axios from 'axios'
const instance = axios.create({
    baseURL: `http://15.206.81.42/`
})

export default instance