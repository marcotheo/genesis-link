/// <reference path="./.sst/platform/config.d.ts" />
import { main_backend } from "./infra/main-backend";
import { main_user_pool } from "./infra/main-userpool";
import { cdn } from "./infra/cdn";
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

    const cdnInfra = cdn();

    const mainUserPool = main_user_pool();

    const mainBackendResult = await main_backend({
      bucket: cdnInfra.AssetsBucket,
      poolId: mainUserPool.poolId,
      poolClientId: mainUserPool.poolClientId,
      poolClientSecret: mainUserPool.poolClientSecret,
    });

    output = {
      ...cdnInfra,
      ...mainBackendResult,
      ...mainUserPool,
    };

    if ($app.stage && ["production", "preview"].includes($app.stage)) {
      console.log("Deploying cloudflare pages ...");

      const cloudflareResults = cloudflare_pages({
        cdnDomain: cdnInfra.AssetsDistribution,
        apiUrl: mainBackendResult.apiUrl,
        poolId: mainUserPool.poolId,
        poolClientId: mainUserPool.poolClientId,
      });

      output = {
        ...output,
        ...cloudflareResults,
      };
    }

    return output;
  },
});
