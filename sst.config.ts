/// <reference path="./.sst/platform/config.d.ts" />

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
    return {};
  },
});
