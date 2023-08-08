import type { APIRoute } from "astro";
import { supabase } from "../../../supabase";

export const post: APIRoute = async ({ request, cookies, redirect }) => {

    /* Get body from request */
    const body = await request.json();
    
    const sessionCookie = body?.session

    console.log(`SESS:Sign:`, sessionCookie);
    
    cookies.set("session", sessionCookie?.access_token as string, {
        path: "/",
    });

    return redirect("/dashboard");

};