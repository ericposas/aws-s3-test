const aws = require('aws-sdk')
require('dotenv').config()
const {
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  BUCKET_NAME
} = process.env

aws.config.update({
  region: 'us-east-1',
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY
})

exports.sign_s3 = (req, res) => {
  console.log('endpoint hit')
  
  const s3 = new aws.S3()
  console.log(req.file)
  const fileParts = req.body.file.name.split('.')
  const fileName = fileParts[0]
  const fileType = fileParts[1]
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Expires: 500,
    ContentType: fileType,
    ACL: 'public-read'
  }

  console.log(s3)

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      console.log(err)
      res.json({ success: false, error: err })
    }
    const returnData = {
      signedRequest: data,
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`
    }
    res.json({ success: true, data: { returnData } })
  })

}
