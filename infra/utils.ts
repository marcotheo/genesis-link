export const getSiteUrl = () => {
  // make  sure this is deployed to cloudflare
  if ($app.stage && ["production", "preview"].includes($app.stage))
    return process.env.DOMAIN
      ? $util.interpolate`${`https://${process.env.DOMAIN}`}`
      : $util.interpolate`${`https://${process.env.APP_NAME}.pages.dev`}`; // cloudflare pages provided domain
};
