import type { APIRoute } from "astro";
import {pathRoutes} from '../../../config/pathRoutes'

export const get: APIRoute = async ({ redirect, cookies }) => {
  cookies.delete("session", {
    path: "/",
  });
  cookies.delete("role", {
    path: "/",
  });
  return redirect(pathRoutes.auth.sinIn);
};