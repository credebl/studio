import { supabase } from "../supabase";


const getUserSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    console.log(`SESSION:DATA::SUCCESS:`, data);
    console.log(`SESSION:DATA:ERROR:`, error);

    if(!error){
        return data.session
    }
}

export default getUserSession;