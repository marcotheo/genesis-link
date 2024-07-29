const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client();

// Function to generate WebP images in different sizes and DPRs
const generateWebPImages = async (inputDir, outputDir, sizes, dprs) => {
  console.log("Optimizing Regular Images ...");

  const existingImages = new Map();

  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    for (const size of sizes) {
      for (const dpr of dprs) {
        const scaledSize = size * dpr;
        const fileName = `${path.parse(file).name}-${size}w-${dpr}x.webp`;
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, fileName);

        // Check if the file already exists
        if (fs.existsSync(outputPath)) {
          existingImages.set(fileName, 1);
          continue;
        }

        await sharp(inputPath)
          .resize(scaledSize)
          .webp({ quality: 80 })
          .toColourspace("srgb")
          .toFile(outputPath);
      }
    }
  }

  return existingImages;
};

// Function to upload files to S3
const uploadFileToS3 = async (filePath, key) => {
  if (!process.env.ASSETS_BUCKET) {
    console.error("ASSETS_BUCKET not defined");
    return;
  }

  const bucketName = process.env.ASSETS_BUCKET;

  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: "image/webp",
  };

  await s3.send(new PutObjectCommand(params));
};

const handler = async () => {
  console.log("(Script) :: Regular-Image-Optimizer initiated ...");

  const basePath = `${process.cwd()}/packages/scripts/src`;
  const inputDir = `${basePath}/assets-input/images`;
  const outputDir = `${basePath}/assets-output/images`;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Define sizes for responsive images
  const sizes = [
    320, // mobile
    480, // mobile
    640, // mobile

    768, // tablet
    1024, // tablet

    1280, // laptops
    1440, // laptops

    1920, // pc monitors
    2560, // pc monitors
  ];

  // Define device pixel ratios
  const dprs = [1, 2];

  try {
    const skipImages = await generateWebPImages(
      inputDir,
      outputDir,
      sizes,
      dprs
    );
    const files = fs.readdirSync(outputDir);

    console.log(
      `Uploading to s3 bucket ${process.env.ASSETS_BUCKET} Optimized Regular Images ...`
    );

    for (const file of files) {
      if (!!skipImages.get(file)) continue;

      const filePath = path.join(outputDir, file);
      const key = `${path.parse(file).name.split("-")[0]}/${file}`;
      await uploadFileToS3(filePath, key);
    }

    console.log(
      "All Regular Images generated and uploaded successfully!",
      skipImages.size > 0
        ? `(Skipped ${skipImages.size} since it was already processed)`
        : ""
    );
  } catch (err) {
    console.log("An error occured at Regular Image Optimizer", err);
  }
};

handler();
