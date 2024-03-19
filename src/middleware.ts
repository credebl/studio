// export default async (request: Request, context: any) => {
//     const response = await context.next();
//     response.headers.set("X-Frame-Options", "SAMEORIGIN"); // Add your header
//     response.headers.set('Content-Security-Policy',"script-src 'self'; frame-ancestors 'self'");
//     response.headers.set("X-CREDEBL", "SSI")
//     console.log("LOG FROM MIDDLEWARE::::::", response)
//     return response;
//   };

// export function onRequest ({ locals, request }, next) {
//   // intercept data from a request
//   // optionally, modify the properties in `locals`
//   locals.title = "New title";

//   console.log(656565, locals, request)
//   // return a Response or the result of calling `next()`
//   return next();
// };


export const onRequest = async (context, next) => {
  const response = await next();
  
  const html = await response.text();
  // const redactedHtml = html.replaceAll("PRIVATE INFO", "REDACTED");
  
  console.log(656565, html, response.headers[Symbol.for('headers map')])

const headers = response.headers

if (!headers[Symbol.for('headers map')]) {
  headers[Symbol.for('headers map')] = new Map();
}

// Set content-type property in the map
headers[Symbol.for('headers map')].set('content-type', { name: 'content-type', value: 'text/html' });
// // Set Access-Control-Allow-Origin property in the map
// headers[Symbol.for('headers map')].set('Access-Control-Allow-Origin', { name: 'Access-Control-Allow-Origin', value: 'http://ayanworks.com' });
// Set content-type property in the map
headers[Symbol.for('headers map')].set('X-Frame-Options', { name: 'X-Frame-Options', value: 'DENY' });

// Get content-type property value
let contentTypeValue = null;
if (headers[Symbol.for('headers map')]) {
  contentTypeValue = headers[Symbol.for('headers map')].get('Access-Control-Allow-Origin')?.value;
}

// Logging the content-type property value
console.log("Content-Type:", headers);

console.log(6565652323, response.headers[Symbol.for('headers map')], headers[Symbol.for('headers map')].get('content-type')?.value)


  return new Response(html, {
      status: 200,
      headers: headers
  });
};