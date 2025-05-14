import { getSiteUrl } from "./utils";

export const main_user_pool = () => {
  const baseDomain = getSiteUrl();

  const signUpLambdaFunction = new sst.aws.Function(
    "CognitoVerificationEmailFunction",
    {
      runtime: "go",
      handler: "./packages/events/signup",
      environment: {
        SITE_URL: baseDomain,
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

  const domainName =
    $app.stage === "production"
      ? process.env.APP_NAME
      : process.env.APP_NAME + "-" + $app.stage;

  // enable cognito domain for oauth logins (3rd party IDP's)
  const userPoolDomain = new aws.cognito.UserPoolDomain("UserPoolDomain", {
    domain: domainName, // e.g., "myapp-auth"
    userPoolId: pool.id,
  });

  const googleIdp = new aws.cognito.IdentityProvider("GoogleProvider", {
    userPoolId: pool.id,
    providerName: "Google",
    providerType: "Google",
    providerDetails: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      authorize_scopes: "openid email profile",
    },
    attributeMapping: {
      email: "email",
      given_name: "given_name",
      family_name: "family_name",
    },
  });

  const client = new aws.cognito.UserPoolClient(
    "UserPoolClient",
    {
      userPoolId: pool.id,
      explicitAuthFlows: [
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
      ],
      tokenValidityUnits: {
        accessToken: "minutes",
        idToken: "minutes",
        refreshToken: "hours",
      },
      accessTokenValidity: 10,
      idTokenValidity: 10,
      refreshTokenValidity: 3,
      generateSecret: true,

      // google or 3rd party logins
      allowedOauthFlows: ["code"],
      allowedOauthScopes: ["email", "openid", "profile"],
      callbackUrls: [process.env.OAUTH_IDP_REDIRECT_URI],
      supportedIdentityProviders: ["COGNITO", "Google"],
    },
    { dependsOn: [googleIdp] }
  );

  // Grant permission for Cognito to invoke the Lambda function
  new aws.lambda.Permission("CognitoLambdaInvokePermission", {
    action: "lambda:InvokeFunction",
    function: signUpLambdaFunction.nodes.function,
    principal: "cognito-idp.amazonaws.com",
    sourceArn: pool.arn,
  });

  return {
    poolId: pool.id,
    poolClientId: client.id,
    poolClientSecret: client.clientSecret,
    signUpLambdaFunction: signUpLambdaFunction.name,
    domain: userPoolDomain.domain,
  };
};
