import type { APIRoute } from "astro";
import {pathRoutes} from '../../../config/pathRoutes'
import { supabase } from "../../../supabase";

export const get: APIRoute = async ({ redirect, cookies }) => {
    const sessionCookie = cookies.get("session").value;
    console.log(`SessionCookie::`, sessionCookie);

    if (!sessionCookie) {
        return redirect(pathRoutes.auth.sinIn)
    }

    const { data: { user }, error } = await supabase.auth.getUser(sessionCookie);
    console.log(`USRE::`, user);

    if (!user || user.role !== "authenticated") {
        return redirect(pathRoutes.auth.sinIn)
    }

    return new Response(JSON.stringify({message: 'success'}), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
}; 