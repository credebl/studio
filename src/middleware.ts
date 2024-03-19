export const onRequest = async (context, next) => {
  const response = await next();
  const html = await response.text();

  const allowedDomains = "https://fonts.googleapis.com/css2 https://www.ayanworks.com https://qaapi.credebl.id https://devapi.credebl.id https://fonts.googleapis.com https://avatars.githubusercontent.com https://fonts.gstatic.com/"

  response.headers.set('Content-Security-Policy',`default-src 'self'; script-src 'self' ${allowedDomains}; style-src 'self' ${allowedDomains}; font-src ${allowedDomains}; img-src 'self' ${allowedDomains}; frame-src 'self' ${allowedDomains}; object-src 'none'; media-src 'self'; connect-src 'self' ${allowedDomains}; form-action 'self'; frame-ancestors 'self'; `);
  response.headers.set('X-Frame-Options', "DENY");
  response.headers.set('X-Content-Type-Options', 'nosniff');

console.log("Headers:::", response.headers);

  return new Response(html, {
      status: 200,
      headers: response.headers
  });
};