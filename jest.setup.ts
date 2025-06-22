import fetch, { Request, Response, Headers } from 'node-fetch';
// expose WHATWG fetch globals so tests using Request/Response work
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fetch = fetch;
// @ts-ignore
global.Request = Request;
// @ts-ignore
global.Response = Response;
// @ts-ignore
global.Headers = Headers;
