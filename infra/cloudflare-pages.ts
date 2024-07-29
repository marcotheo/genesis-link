export const cloudflare_pages = () => {
  if (!process.env.CLOUDFLARE_DEFAULT_ACCOUNT_ID) {
    console.error("CLOUDFLARE_DEFAULT_ACCOUNT_ID does not exist");
    return;
  }

  if (!process.env.GITHUB_OWNER) {
    console.error("GITHUB_OWNER does not exist");
    return;
  }

  if (!process.env.GITHUB_REPO_NAME) {
    console.error("GITHUB_REPO_NAME does not exist");
    return;
  }

  if (!process.env.GITHUB_BRANCH) {
    console.error("GITHUB_BRANCH does not exist");
    return;
  }

  if (!process.env.APP_NAME) {
    console.error("APP_NAME does not exist");
    return;
  }

  const accountId = process.env.CLOUDFLARE_DEFAULT_ACCOUNT_ID;

  const app = new cloudflare.PagesProject(`${process.env.APP_NAME}FE`, {
    accountId,
    name: process.env.APP_NAME,
    productionBranch: "cloudflare-test",
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
