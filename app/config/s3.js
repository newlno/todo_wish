require("dotenv").config();

const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const path = require("path");

AWS.config.update({
  accessKeyId: process.env.S3KEY,
  secretAccessKey: process.env.S3PW,
  region: process.env.S3REGION,
});

const s3 = new AWS.S3();
const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp"];

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3BUCKET,
    key: function (req, file, callback) {
      const uploadDirectory = req.query.directory;
      const extension = path.extname(file.originalname);
      if (!allowedExtensions.includes(extension)) {
        return callback(new Error("wrong extension"));
      }
      callback(null, `${uploadDirectory}/${Date.now()}_${file.originalname}`);
    },
    acl: "public-read-write",
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const getImage = (module.exports = { upload });
