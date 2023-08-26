import type { AstroCookies } from "astro";
import { getSupabaseClient } from "../supabase";

export const checkUserSession = async (cookies: AstroCookies): Promise<boolean> => {
    const sessionCookie = cookies.get("session").value;

    if (!sessionCookie) {
        return false
    }

    const { data: { user }, error } = await getSupabaseClient().auth.getUser(sessionCookie);
    
    if (!user || user.role !== "authenticated") {
        return false
    }

    return true
}