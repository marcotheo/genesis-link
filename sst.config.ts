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
        aws: {
          profile: process.env.PROFILE,
          region: process.env.AWS_REGION as any,
        },
        cloudflare: true,
      },
    };
  },
  async run() {
    const mainUserPool = main_user_pool();

    const mainBackendResult = await main_backend({
      poolId: mainUserPool.pool.id,
      poolClientId: mainUserPool.client.id,
      poolClientSecret: mainUserPool.clientSecret,
    });

    let output = {
      roleName: mainBackendResult.role.name,
      apiUrl: mainBackendResult.api.apiEndpoint,
      poolId: mainUserPool.pool.id,
      poolClient: mainUserPool.client.id,
      poolClientSecret: mainUserPool.clientSecret,
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

    if (
      process.env.NODE_ENV &&
      ["production", "preview"].includes(process.env.NODE_ENV)
    ) {
      const cloudflareResults = cloudflare_pages();

      output = {
        ...output,
        ...cloudflareResults,
      };
    }

    return output;
  },
});
