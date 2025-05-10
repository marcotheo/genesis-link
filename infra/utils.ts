export const getSiteUrl = () => {
  // make  sure this is deployed to cloudflare
  if ($app.stage && ["production", "preview"].includes($app.stage))
    return process.env.DOMAIN
      ? $util.interpolate`${`https://${process.env.DOMAIN}`}`
      : $util.interpolate`${`https://${process.env.APP_NAME}.pages.dev`}`; // cloudflare pages provided domain

  return $util.interpolate`${`http://${process.env.DOMAIN ?? "localhost:5173"}`}`;
};

export const checkRequiredEnvs = () => {
  if (!process.env.APP_NAME) {
    console.error("must define APP_NAME env variable");
    return false;
  }

  if (!process.env.OAUTH_IDP_REDIRECT_URI) {
    console.error("must define OAUTH_IDP_REDIRECT_URI env variable");
    return false;
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("must define GOOGLE_CLIENT_ID env variable");
    return false;
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error("must define GOOGLE_CLIENT_SECRET env variable");
    return false;
  }

  if (["production", "preview"].includes($app.stage)) {
    if (!process.env.DOMAIN) {
      console.error("For production deployment 'DOMAIN' env is required");
      return false;
    }

    if (!process.env.ACM_ARN) {
      console.error("For production deployment 'ACM_ARN' env is required");
      return false;
    }

    if (!process.env.ZONE_ID) {
      console.error("For production deployment 'ZONE_ID' env is required");
      return false;
    }
  }

  return true;
};
