import { envConfig } from "./config/envConfig";
import { pathRoutes } from "./config/pathRoutes";

export const onRequest = async (context: any, next: any) => {
  const response = await next();
  const html = await response.text();
 
  const domains = envConfig.PUBLIC_ALLOW_DOMAIN;
  
  const allowedDomain = `${context.url.origin} ${domains}`
  
  const nonce = "dynamicNONCE" + new Date().getTime().toString();

  response.headers.set('Content-Security-Policy',`default-src 'self'; script-src 'self' ${allowedDomain} 'nonce-${nonce}_scripts'; style-src 'unsafe-inline' ${allowedDomain}; font-src ${allowedDomain}; img-src 'self' data: ${allowedDomain}; frame-src 'self' ${allowedDomain}; object-src 'none'; media-src 'self'; connect-src 'self' ${allowedDomain}; form-action 'self'; frame-ancestors 'self'; `);
  response.headers.set('X-Frame-Options', "DENY");
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Access-Control-Allow-Origin', allowedDomain)
  response.headers.set('ServerTokens', 'dummy_server_name')
  response.headers.set('server_tokens', 'off')
  response.headers.set('server', 'dummy_server_name')
  response.headers.set('Server', 'dummy_server_name')
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  let updatedHtml = await html.split("<script").join(`<script nonce="${nonce}_scripts" `)

  // If Access token and refresh token is not valid then redirect user to login page
  if(response.status === 302){
    return context.redirect(pathRoutes.auth.sinIn)
  }
  
  return new Response(updatedHtml, {
      status: 200,
      headers: response.headers
  });
};