import type { AstroCookies } from "astro";
import { pathRoutes } from "../config/pathRoutes";
import { supabase } from "../supabase";

export const checkUserSession = async (cookies: AstroCookies): Promise<boolean> => {
    const sessionCookie = cookies.get("session").value;
    console.log(`SessionCookie::`, sessionCookie);

    if (!sessionCookie) {
        return false
    }

    const { data: { user }, error } = await supabase.auth.getUser(sessionCookie);
    console.log(`USRE::`, user);

    if (!user || user.role !== "authenticated") {
        return false
    }

    return true
}