import { axiosGet, axiosPost } from "../services/apiRequests";

export const getAllSchemas = async() => {
  const token = localStorage.getItem('access_token');
    const details = {
        url: 'http://localhost:5000/schemas?orgId=2',
        config: {
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        },
      };
      
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    }
}

export const addSchema = async(payload:any) => {
  const token = localStorage.getItem('access_token');
  const details = {
    url: 'http://localhost:5000/schemas',
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
}
      
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    } 
}

