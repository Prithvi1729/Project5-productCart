const aws = require("aws-sdk");

aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1",
});

const uploadFile = async function (files) {
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });

    let uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: "Group24/" + files.originalname,
      Body: files.buffer
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data.Location);
    });
  });
};


module.exports.uploadFile=uploadFile