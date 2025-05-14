/// <reference path="./.sst/platform/config.d.ts" />

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
    const { checkRequiredEnvs } = await import("./infra/utils");
    const { cdn } = await import("./infra/cdn");
    const { main_user_pool } = await import("./infra/main-userpool");
    const { main_backend } = await import("./infra/main-backend");
    const { cloudflare_pages } = await import("./infra/cloudflare-pages");

    if (!checkRequiredEnvs()) return;

    const cdnInfra = cdn();

    const userPool = main_user_pool();

    const backendInfra = await main_backend({
      bucket: cdnInfra.AssetsBucket,
      poolId: userPool.poolId,
      poolClientId: userPool.poolClientId,
      poolClientSecret: userPool.poolClientSecret,
      poolDomain: userPool.domain,
      cloudFrontUrl: cdnInfra.AssetsDistribution,
    });

    const cloudflareResults = cloudflare_pages({
      cdnDomain: cdnInfra.AssetsDistribution,
      apiUrl: backendInfra.apiUrl,
      poolId: userPool.poolId,
      poolClientId: userPool.poolClientId,
      poolDomain: userPool.domain,
    });

    return {
      ...cdnInfra,
      ...userPool,
      ...backendInfra,
      ...cloudflareResults,
    };
  },
});
