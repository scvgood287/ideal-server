const AWS = require("aws-sdk");
const multer = require("@koa/multer");
const multerS3 = require("multer-s3");
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

let S3params = {
  bucket: process.env.AWS_BUCKET_NAME,
  acl: "private",
};

const upload = multer({
  fileFilter: (_req, file, cb) => {
    try {
      cb(null, file.mimetype.split("/")[0] === "image");
    } catch (err) {
      cb(err);
    }
  },
  storage: multerS3({
    ...S3params,
    s3,
    key: (_req, file, cb) => {
      const { fieldname, originalname } = file;

      let extension = path.extname(originalname);
      let basename = path.basename(originalname, extension);

      cb(null, `images/${fieldname}/${basename}-${Date.now()}${extension}`);
    },
  }),
});

const uploadtoS3Any = () => upload.any();
const deleteS3Game = async (game) => {
  const Bucket = S3params.bucket;
  let params = { Bucket, Prefix: `images/${game}` };
  let deletedS3Images = [];

  const getObjects = async () => {
    const listObjects = await s3.listObjectsV2(params).promise();
    const { Contents, isTruncated } = listObjects;

    if (Contents?.length) {
      const deletedObjects = await s3
        .deleteObjects({
          Bucket,
          Delete: {
            Objects: Contents.map(({ Key }) => {
              return { Key };
            }),
          },
        })
        .promise();
      deletedS3Images = [...deletedS3Images, ...deletedObjects.Deleted];

      if (isTruncated) {
        await getObjects();
      }
    }
  };
  await getObjects();

  return deletedS3Images;
};
const deleteS3Image = async ({ imageUrl: { key } }) => {
  await s3.deleteObject({
      Bucket: S3params.bucket,
      Key: key,
    }).promise();
};
module.exports = {
  uploadtoS3Any,
  deleteS3Game,
  deleteS3Image,
};
