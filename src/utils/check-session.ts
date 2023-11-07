import type { AstroCookies } from "astro";
import { getSupabaseClient } from "../supabase";
import { getFromCookies } from "../api/Auth";

export const checkUserSession = async (cookies: AstroCookies): Promise<boolean> => {
    const sessionCookie = getFromCookies(cookies, "session");

    if (!sessionCookie) {
        return false
    }

    const { data: { user }, error } = await getSupabaseClient().auth.getUser(sessionCookie);
    
    if (!user || user.role !== "authenticated") {
        return false
    }

    return true
}