export const cdn = () => {
  const isProd = $app.stage && ["production", "preview"].includes($app.stage);

  const bucket = new aws.s3.Bucket("AssetsBucket", {
    acl: "private",
    forceDestroy: true,
    corsRules: [
      {
        allowedHeaders: ["*"],
        allowedMethods: ["PUT", "POST", "GET"],
        allowedOrigins: [
          isProd ? (process.env.DOMAIN ? process.env.DOMAIN : "*") : "*",
        ],
        exposeHeaders: ["ETag"],
        maxAgeSeconds: 3000,
      },
    ],
  });

  // Create a CloudFront Origin Access Identity
  const oai = new aws.cloudfront.OriginAccessIdentity(
    "AssetsOriginIdentity",
    {}
  );

  // Create the policy document
  const bucketPolicyDocument = aws.iam.getPolicyDocumentOutput({
    statements: [
      {
        effect: "Allow",
        principals: [
          {
            type: "AWS",
            identifiers: [oai.iamArn],
          },
        ],
        actions: ["s3:GetObject"],
        resources: [bucket.arn.apply((arn) => `${arn}/*`)],
      },
    ],
  });

  // Attach the policy to the bucket
  new aws.s3.BucketPolicy("AssetsBucketPolicy", {
    bucket: bucket.id,
    policy: bucketPolicyDocument.json,
  });

  // Create a CloudFront distribution
  const distribution = new aws.cloudfront.Distribution(
    "AssetsBucketDistribution",
    {
      enabled: true,
      origins: [
        {
          domainName: bucket.bucketRegionalDomainName,
          originId: bucket.arn,
          s3OriginConfig: {
            originAccessIdentity: oai.cloudfrontAccessIdentityPath,
          },
        },
      ],
      defaultCacheBehavior: {
        targetOriginId: bucket.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        forwardedValues: {
          queryString: false,
          cookies: {
            forward: "none",
          },
        },
        defaultTtl: 3600,
        maxTtl: 86400,
        minTtl: 0,
      },
      priceClass: "PriceClass_100",
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      viewerCertificate: {
        cloudfrontDefaultCertificate: true,
      },
    }
  );

  return {
    AssetsBucket: bucket.bucket,
    AssetsDistribution: distribution.domainName,
  };
};
