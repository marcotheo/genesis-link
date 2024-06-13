/// <reference path="./.sst/platform/config.d.ts" />

import { main_backend } from "./infra/main-backend";
import { main_user_pool } from "./infra/main-userpool";

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
      },
    };
  },
  async run() {
    const mainUserPool = main_user_pool();
    const mainBackendResult = await main_backend({
      poolId: mainUserPool.pool.id,
      poolClientId: mainUserPool.client.id,
      poolClientSecret: mainUserPool.clientSecret
    });

    return {
      roleName: mainBackendResult.role.name,
      apiUrl: mainBackendResult.api.apiEndpoint,
      poolId: mainUserPool.pool.id,
      poolClient: mainUserPool.client.id,
      poolClientSecret: mainUserPool.clientSecret,
    };
  },
});
