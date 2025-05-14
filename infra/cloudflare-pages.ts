import { getSiteUrl } from "./utils";

export const cloudflare_pages = ({
  cdnDomain,
  apiUrl,
  poolId,
  poolClientId,
  poolDomain,
}: {
  cdnDomain: $util.Output<string>;
  apiUrl: $util.Output<string> | string;
  poolId: $util.Output<string>;
  poolClientId: $util.Output<string>;
  poolDomain: $util.Output<string>;
}) => {
  if (!["production", "preview"].includes($app.stage)) return {};

  console.log("Deploying cloudflare pages ...");

  const accountId = process.env.CLOUDFLARE_DEFAULT_ACCOUNT_ID;
  const domainName =
    ($app.stage === "production" ? "" : `${$app.stage}.`) + process.env.DOMAIN;
  const zoneId = process.env.ZONE_ID;
  const baseDomain = getSiteUrl();

  const app = new cloudflare.PagesProject(`${process.env.APP_NAME}FE`, {
    accountId,
    name:
      process.env.APP_NAME +
      ($app.stage === "production" ? "" : `-${$app.stage}.`),
    productionBranch: process.env.GITHUB_BRANCH,
    buildConfig: {
      buildCaching: true,
      buildCommand: "npm run build",
      destinationDir: "dist",
      rootDir: "packages/frontend",
    },
    deploymentConfigs: {
      production: {
        environmentVariables: {
          NODE_VERSION: "v20.13.1",
          QWIK_CDN_URL: $util.interpolate`https://${cdnDomain}`,
          QWIK_API_URL: apiUrl,
          QWIK_AWS_REGION: process.env.AWS_REGION,
          QWIK_POOL_ID: poolId,
          QWIK_POOL_CLIENT_ID: poolClientId,
          QWIK_IDP_REDIRECT_URI: baseDomain.apply((v) => v + "/sign-in"),
          QWIK_POOL_DOMAIN: poolDomain.apply(
            (v) => `https://${v}.auth.${aws.config.region}.amazoncognito.com`
          ),
        },
      },
    },
    source: {
      type: "github",
      config: {
        deploymentsEnabled: true,
        owner: process.env.GITHUB_OWNER,
        repoName: process.env.GITHUB_REPO_NAME,
        productionBranch: process.env.GITHUB_BRANCH,
      },
    },
  });

  // Associate the custom domain with the Pages project
  new cloudflare.PagesDomain("CustomPagesDomain", {
    accountId,
    projectName: app.name,
    domain: domainName,
  });

  // Add the Route 53 DNS record
  new aws.route53.Record("PagesDNSRecord", {
    name: domainName,
    type: "CNAME",
    zoneId,
    records: [app.subdomain],
    ttl: 300,
  });

  // Function to trigger initial deployment
  const triggerDeployment = async (projectId: string) => {
    if (!process.env.CLOUDFLARE_API_TOKEN) return;

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectId}/deployments`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return response.json();
  };

  // Trigger deployment after project creation
  app.id.apply(async (projectId) => {
    const result = await triggerDeployment(projectId);
    console.log("Initial deployment triggered:", result);
  });

  return {
    CloudFlareDomain: app.domains[0],
  };
};
