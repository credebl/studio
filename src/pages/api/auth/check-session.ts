import type { APIRoute } from "astro";
import {pathRoutes} from '../../../config/pathRoutes'
import { getSupabaseClient } from "../../../supabase";

export const get: APIRoute = async ({ redirect, cookies }) => {
    const sessionCookie = cookies.get("session").value;

    if (!sessionCookie) {
        return redirect(pathRoutes.auth.sinIn)
    }

    const { data: { user }, error } = await getSupabaseClient().auth.getUser(sessionCookie);

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