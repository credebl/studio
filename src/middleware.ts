import { allowedDomains } from "./config/CommonConstant";

export const onRequest = async (context: any, next: any) => {
  const response = await next();
  const html = await response.text();
 
  
  const allowedDomain = `${context.site.origin} ${allowedDomains}`
  
  const nonce = "dynamicNONCE" + new Date().getTime().toString();

  // response.headers.set('Content-Security-Policy',`default-src 'self'; script-src 'self' ${allowedDomain} 'nonce-${nonce}_scripts'; style-src 'self' ${allowedDomain} 'nonce-${nonce}_styles'; font-src ${allowedDomain}; img-src 'self' ${allowedDomain}; frame-src 'self' ${allowedDomain}; object-src 'none'; media-src 'self'; connect-src 'self' ${allowedDomain}; form-action 'self'; frame-ancestors 'self'; `);

  response.headers.set('Content-Security-Policy',`default-src 'self'; script-src 'unsafe-inline' ${allowedDomain}; style-src 'unsafe-inline' ${allowedDomain}; font-src ${allowedDomain}; img-src 'self' ${allowedDomain}; frame-src 'self' ${allowedDomain}; object-src 'none'; media-src 'self'; connect-src 'self' ${allowedDomain}; form-action 'self'; frame-ancestors 'self'; `);
  response.headers.set('X-Frame-Options', "DENY");
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Access-Control-Allow-Origin', allowedDomain)
  response.headers.set('ServerTokens', 'Prod')
  response.headers.set('server_tokens', 'off')
  response.headers.set('server', 'SSI')
  response.headers.set('Server', 'SSI')
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // let updatedHtml = await html.split("<script").join(`<script nonce="${nonce}_scripts" `).split("style=\"").join(` nonce="${nonce}_styles" style="`).split("<style").join(`<style nonce="${nonce}_styles" `);

  // console.log(32423, updatedHtml);
  
  return new Response(html, {
      status: 200,
      headers: response.headers
  });
};