/// <reference path="./.sst/platform/config.d.ts" />

import { main_backend } from "./infra/backend-go";

export default $config({
  app(input) {
    return {
      name: "genesis-fleet",
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
    const mainBackendResult = main_backend();

    return {
      roleName: mainBackendResult.role.name,
      apiUrl: mainBackendResult.api.apiEndpoint,
    };
  },
});
