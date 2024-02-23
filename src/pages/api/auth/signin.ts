import type { APIRoute } from "astro";
import { pathRoutes } from "../../../config/pathRoutes";
import { setToCookies } from "../../../api/Auth";

export const post: APIRoute = async ({ request, cookies, redirect }) => {
    /* Get body from request */
    const body = await request.json();

    const sessionCookie = body?.data || body

    switch (true) {
        case Boolean(sessionCookie?.access_token || sessionCookie?.role):
            setToCookies(cookies, "session", sessionCookie?.access_token as string, {
                path: "/"
            })
            setToCookies(cookies, "role", sessionCookie?.role as string, {
                path: "/"
            })
            break;
        case Boolean(sessionCookie?.orgId):
            setToCookies(cookies, 'orgId', sessionCookie?.orgId as string, {
                path: "/"
            })
            break;
        case Boolean(sessionCookie?.userProfile):
            setToCookies(cookies, "userProfile", sessionCookie?.userProfile, {
                path: "/"
            })
            break;
        default:
            break;
    }

    return redirect(pathRoutes.users.dashboard);

};
