import * as path from "path";

export const main_backend =  async({
  poolId,
  poolClientId,
  poolClientSecret,
}: {
  poolId: $util.Output<string>;
  poolClientId: $util.Output<string>;
  poolClientSecret: $util.Output<string>;
}) => {
  const callerIdentity = aws.getCallerIdentity();
  const accountId = await callerIdentity.then((identity) => identity.accountId);

  // Create an AWS Lambda function
  const role = new aws.iam.Role(`${process.env.PROJ_NAME}BackendRole`, {
    assumeRolePolicy: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "sts:AssumeRole",
          Principal: {
            Service: "lambda.amazonaws.com",
          },
          Effect: "Allow",
        },
      ],
    },
  });

  new aws.iam.RolePolicy(`${process.env.PROJ_NAME}BackendRolePolicy`, {
    role: role.id,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ],
          Effect: "Allow",
          Resource: "*",
        },
        {
          Action: [
            "cognito-idp:*"
          ],
          Effect: "Allow",
          Resource: [`arn:aws:cognito-idp:${aws.config.region}:${accountId}:userpool/*`]
        }
      ],
    },
  });

  const filePath = path.join(
    __dirname,
    "../../../packages/backend",
    "deployment.zip"
  );

  const lambdaFunction = new aws.lambda.Function(`${process.env.PROJ_NAME}Lambda`, {
    runtime: aws.lambda.Runtime.CustomAL2023,
    code: new $util.asset.FileArchive(filePath),
    timeout: 10,
    role: role.arn,
    handler: "bootstrap", // Custom runtimes can have handler set to an empty string ""
    environment: {
      variables: {
        DB_URL: process.env.DB_URL,
        POOL_ID: poolId,
        POOL_CLIENT_ID: poolClientId,
        POOL_CLIENT_SECRET: poolClientSecret
      },
    },
  });

  // Create an API Gateway
  const api = new aws.apigatewayv2.Api(`${process.env.PROJ_NAME}APIGateway`, {
    protocolType: "HTTP",
  });

  const integration = new aws.apigatewayv2.Integration(
    `${process.env.PROJ_NAME}APIGatewayIntegration`,
    {
      apiId: api.id,
      integrationType: "AWS_PROXY",
      integrationUri: lambdaFunction.arn,
      integrationMethod: "ANY",
      payloadFormatVersion: "2.0",
      passthroughBehavior: "WHEN_NO_TEMPLATES",
    }
  );

  new aws.apigatewayv2.Route(`${process.env.PROJ_NAME}APIGatewayRoute`, {
    apiId: api.id,
    routeKey: "$default",
    target: $util.interpolate`integrations/${integration.id}`,
  });

  new aws.apigatewayv2.Stage(`${process.env.PROJ_NAME}APIGatewayDeployment`, {
    apiId: api.id,
    autoDeploy: true,
    name: "$default",
  });

  // Grant permissions
  new aws.lambda.Permission(
    `${process.env.PROJ_NAME}APIGatewayPermssions`,
    {
      action: "lambda:InvokeFunction",
      function: lambdaFunction,
      principal: "apigateway.amazonaws.com",
      sourceArn: $util.interpolate`${api.executionArn}/*/*`,
    }
  );

  return {
    role,
    api,
  };
};
