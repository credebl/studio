
import type { APIRoute } from "astro";

export const post: APIRoute = async ({ request, cookies, redirect }) => {
  

    const body = await request.json();

    cookies.set("session", body.session, {
    path: "/",
  });

    return redirect("/dashboard");
};