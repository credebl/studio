export const onRequest = async (context, next) => {
  const response = await next();
  const html = await response.text();
 
  
  const allowedDomains = context.site.origin + " https://www.blockster.global https://www.ayanworks.com https://qaapi.credebl.id https://devapi.credebl.id https://api.credebl.id https://*.credebl.id https://fonts.googleapis.com https://avatars.githubusercontent.com https://fonts.gstatic.com https://dev-org-logo.s3.ap-south-1.amazonaws.com https://flowbite-admin-dashboard.vercel.app/ wss://devapi.credebl.id wss://qaapi.credebl.id wss://api.credebl.id wss://*.credebl.id"
  
  const nonce = "dynamicNONCE" + new Date().getTime().toString();

  // response.headers.set('Content-Security-Policy',`default-src 'self'; script-src 'self' ${allowedDomains} 'nonce-${nonce}_scripts'; style-src 'self' ${allowedDomains} 'nonce-${nonce}_styles'; font-src ${allowedDomains}; img-src 'self' ${allowedDomains}; frame-src 'self' ${allowedDomains}; object-src 'none'; media-src 'self'; connect-src 'self' ${allowedDomains}; form-action 'self'; frame-ancestors 'self'; `);
  
  response.headers.set('Content-Security-Policy',`default-src 'self'; font-src ${allowedDomains}; img-src 'self' ${allowedDomains}; frame-src 'self' ${allowedDomains}; object-src 'none'; media-src 'self'; connect-src 'self' ${allowedDomains}; form-action 'self'; frame-ancestors 'self'; `);
  response.headers.set('X-Frame-Options', "DENY");
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Access-Control-Allow-Origin', allowedDomains)
  response.headers.set('ServerTokens', 'Prod')
  response.headers.set('server_tokens', 'off')
  response.headers.set('Server', 'CustomServer')

  // let updatedHtml = await html.split("<script").join(`<script nonce="${nonce}_scripts"`).split("<style").join(`<style nonce="${nonce}_styles" `).split("style=\"").join(`nonce="${nonce}_styles" style="`);

  return new Response(html, {
      status: 200,
      headers: response.headers
  });
};