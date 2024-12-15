import type { RequestHandler } from "@builder.io/qwik-city";
import { baseCDNUrl } from "~/common/constants";
import { isDev } from "@builder.io/qwik/build";

export const onRequest: RequestHandler = (event) => {
  if (isDev) return; // Will not return CSP headers in dev mode
  const nonce = crypto.randomUUID().replace(/-/g, ""); // Your custom nonce logic here
  event.sharedMap.set("@nonce", nonce);

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `connect-src 'self' https://0wozmmq0x9.execute-api.ap-southeast-1.amazonaws.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' 'unsafe-inline' ${baseCDNUrl} data:`,
    `frame-src 'self' 'nonce-${nonce}'`,
    `object-src 'none'`,
    `base-uri 'self'`,
  ];

  event.headers.set("Content-Security-Policy", csp.join("; "));
};
