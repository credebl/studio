import { getSupabaseClient } from '../../supabase';

const UpdatePassword = () => {

    const resetPassword = async () => {
                const { data, error } = await getSupabaseClient().auth.updateUser({ password: 'Pass' });

                console.log(`RESET:SUCCESS::`, data);
                console.log(`RESET:ERROR::`, error);
                
    }

    return (
        <div>
            <button onClick={resetPassword}>
                Reset Password
            </button>
        </div>
    )

}

export default UpdatePassword