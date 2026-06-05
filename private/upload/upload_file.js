const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const path = require("path");

const s3Config = {
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESSKEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRETACCEESSKEY,
  },
};

const s3Client = new S3Client(s3Config);
const storage = multer.memoryStorage();
const upload = multer({ storage });


const handleUpload = async (req, res) => {
  try {
    const file = req.file;
    const fileExtension = path.extname(file.originalname); // Extract the file extension
    const newFileName = `${uuidv4()}${fileExtension}`; // Append the file extension to the new file name
    const bucketName = process.env.AWS_BUCKET_NAME;
    const bucketParams = {
      Bucket: bucketName,
      Key: newFileName,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype, // Set the ContentType based on file mimetype
    };
    const fileURL = `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(newFileName)}`;

    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    res.status(200).json({ success: true, url: fileURL });
  } catch (err) {
    console.log("Error", err);
    res.status(500).send("Error uploading file");
  }
};

module.exports = {
  handleUpload,
};
