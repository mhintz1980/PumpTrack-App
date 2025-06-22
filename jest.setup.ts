// @ts-nocheck
/**
 * Polyfill WHAT-WG fetch primitives for Jest (CommonJS runtime)
 */
const fetch = require('node-fetch');      // node-fetch v2 (CJS)
global.fetch    = fetch;
global.Request  = fetch.Request;
global.Response = fetch.Response;
global.Headers  = fetch.Headers;

// --- shim Response.json so NextResponse.json works under Jest ---
if (typeof Response !== 'undefined' && typeof Response.json !== 'function') {
  Response.json = (data, init = {}) =>
    new Response(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
}
