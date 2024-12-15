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
    if (!process.env.APP_NAME) {
      console.error("must define APP_NAME env variable");
      return;
    }

    let output = {};

    const mainUserPool = main_user_pool();

    const mainBackendResult = await main_backend({
      poolId: mainUserPool.poolId,
      poolClientId: mainUserPool.poolClientId,
      poolClientSecret: mainUserPool.poolClientSecret,
    });

    output = {
      ...output,
      ...mainBackendResult,
      ...mainUserPool,
    };

    if ($app.stage && ["production", "preview"].includes($app.stage)) {
      console.log("Deploying cloudflare pages ...");

      const cloudflareResults = cloudflare_pages({
        apiUrl: mainBackendResult.apiUrl,
        poolId: mainUserPool.poolId,
        poolClientId: mainUserPool.poolClientId,
      });

      output = {
        ...output,
        ...cloudflareResults,
      };
    }

    // const cdnInfra = images_cdn();

    output = {
      ...output,
      // ...cdnInfra,
    };

    return output;
  },
});
