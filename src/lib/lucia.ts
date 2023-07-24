import { PrismaClient } from "@prisma/client";
import { astro } from "lucia-auth/middleware";
// src/lib/lucia.ts
import lucia from "lucia-auth";
import prisma from "@lucia-auth/adapter-prisma";

const client = new PrismaClient();

export const auth = lucia({
    adapter: prisma(client),
    env: import.meta.env.PROD ? "PROD" : "DEV",
    middleware: astro(),
    transformDatabaseUser: (userData) => {
        return {
            userId: userData.id,
            email: userData.email
        };
    }
});

export type Auth = typeof auth;