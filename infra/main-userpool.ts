export const main_user_pool = () => {
  const pool = new sst.aws.CognitoUserPool(
    `${process.env.PROJ_NAME}MainUserPool`
  );

  const client = pool.addClient(`${process.env.PROJ_NAME}MainUserClient`, {
    transform: {
      client: {
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
      },
    },
  });

  return {
    pool,
    client,
    clientSecret: client.nodes.client.clientSecret,
  };
};
