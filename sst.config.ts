/// <reference path="./.sst/platform/config.d.ts" />
import { main_backend } from "./infra/main-backend";
import { main_user_pool } from "./infra/main-userpool";
import { images_cdn } from "./infra/images-cdn";
import { cloudflare_pages } from "./infra/cloudflare-pages";

export default $config({
  app(input) {
    return {
      name: process.env.APP_NAME,
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: true,
        cloudflare: true,
      },
    };
  },
  async run() {
    let output = {};
    let siteUrl = $util.interpolate`${"http://localhost:5173"}`;

    if (
      process.env.NODE_ENV &&
      ["production", "preview"].includes(process.env.NODE_ENV)
    ) {
      if (!process.env.DOMAN_NAME) {
        console.error("must define DOMAN_NAME env variable");
        return;
      }

      const cloudflareResults = cloudflare_pages();

      siteUrl = cloudflareResults.CloudFlareDomain;

      output = {
        ...output,
        ...cloudflareResults,
      };
    }

    const mainUserPool = main_user_pool({ siteUrl });

    const mainBackendResult = await main_backend({
      poolId: mainUserPool.poolId,
      poolClientId: mainUserPool.poolClientId,
      poolClientSecret: mainUserPool.poolClientSecret,
    });

    output = {
      ...mainBackendResult,
      ...mainUserPool,
    };

    if (!process.env.APP_NAME) {
      console.error("must define APP_NAME env variable");
      return;
    }

    const cdnInfra = images_cdn();

    output = {
      ...output,
      ...cdnInfra,
    };

    return output;
  },
});
