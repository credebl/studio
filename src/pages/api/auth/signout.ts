import type { APIRoute } from "astro";
import { clearLocalStorage } from "../../../api/Auth";
import { pathRoutes } from "../../../config/pathRoutes";

export const get: APIRoute = async ({ redirect, cookies }) => {
    console.log(`SIGNOUT`);
    
    await clearLocalStorage()

    return redirect(`/signIn`);
    
};