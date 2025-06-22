/**
 * Polyfill WHAT-WG fetch primitives for Jest (CommonJS runtime)
 */
const fetch = require('node-fetch');      // node-fetch v2 (CJS)
global.fetch    = fetch;
global.Request  = fetch.Request;
global.Response = fetch.Response;
global.Headers  = fetch.Headers;
