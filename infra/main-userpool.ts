import path = require("path");

export const main_user_pool = ({
  siteUrl,
}: {
  siteUrl: $util.Output<string>;
}) => {
  // Create an IAM Role for the Lambda function
  const lambdaRole = new aws.iam.Role("SignUpCognitoLambdaRole", {
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

  // Attach a policy to the IAM Role to allow sending emails via an external service
  new aws.iam.RolePolicy("SignUpCognitoLambdaRolePolicy", {
    role: lambdaRole.id,
    policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ],
          Resource: "*",
        },
      ],
    }),
  });

  const filePath = `${process.cwd()}/packages/events/signup/deployment.zip`;

  // Create a Lambda function for custom email sending
  const signUpLambdaFunction = new aws.lambda.Function(
    "CognitoCustomMessageLambda",
    {
      runtime: aws.lambda.Runtime.CustomAL2023,
      role: lambdaRole.arn,
      handler: "bootstrap", // Custom runtimes can have handler set to an empty string ""
      code: new $util.asset.FileArchive(filePath),
      environment: {
        variables: {
          SITE_URL: siteUrl,
        },
      },
    }
  );

  const pool = new aws.cognito.UserPool("UserPool", {
    autoVerifiedAttributes: ["email"],
    usernameAttributes: ["email"],
    emailConfiguration: {
      emailSendingAccount: "COGNITO_DEFAULT", // Use Cognito's default email sending
    },
    verificationMessageTemplate: {
      defaultEmailOption: "CONFIRM_WITH_CODE",
      emailMessage: "Your verification code is {####}.",
      emailSubject: "Your verification code",
      smsMessage: "Your verification code is {####}.",
    },
    lambdaConfig: {
      customMessage: signUpLambdaFunction.arn,
    },
  });

  const client = new aws.cognito.UserPoolClient("UserPoolClient", {
    userPoolId: pool.id,
    explicitAuthFlows: ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"],
    tokenValidityUnits: {
      accessToken: "minutes",
      idToken: "minutes",
      refreshToken: "hours",
    },
    accessTokenValidity: 10,
    idTokenValidity: 10,
    refreshTokenValidity: 3,
    generateSecret: true,
  });

  // Grant permission for Cognito to invoke the Lambda function
  new aws.lambda.Permission("CognitoLambdaInvokePermission", {
    action: "lambda:InvokeFunction",
    function: signUpLambdaFunction,
    principal: "cognito-idp.amazonaws.com",
    sourceArn: pool.arn,
  });

  return {
    poolId: pool.id,
    poolClientId: client.id,
    poolClientSecret: client.clientSecret,
    signUpLambdaFunction: signUpLambdaFunction.name,
  };
};
