import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware(async (_, next) => {
    console.log('Middleware TEST');
    const response = await next();

    return response;
});
