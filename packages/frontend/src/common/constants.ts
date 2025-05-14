export const baseApiUrl =
  process.env.QWIK_MODE === "production" && process.env.QWIK_API_URL
    ? process.env.QWIK_API_URL
    : "";
export const baseCDNUrl = process.env.QWIK_CDN_URL || "";
export const awsRegion = process.env.QWIK_AWS_REGION || "";
export const userPoolId = process.env.QWIK_POOL_ID || "";
export const poolClientId = process.env.QWIK_POOL_CLIENT_ID || "";
export const oauthRedirectUrl = process.env.QWIK_IDP_REDIRECT_URI || "";
export const poolDomain = process.env.QWIK_POOL_DOMAIN || "";
