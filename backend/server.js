const express = require('express')
const aws = require('aws-sdk')
const bodyParser = require('body-parser')
const multer = require('multer')
const multerS3 = require('multer-s3')
const fs = require('fs')
const request = require('request')
const axios = require('axios')
const path = require('path')
require('dotenv').config()
const {
  BUCKET_NAME,
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  REGION
} = process.env

aws.config.update({
  signatureVersion: 'v4',
  secretAccessKey: SECRET_ACCESS_KEY,
  accessKeyId: ACCESS_KEY_ID,
  region: REGION
})

const app = express()
const s3 = new aws.S3()

app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json())

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },
    key: (req, file, cb) => {
      cb(null, file.originalname)
    }
  })
})

app.use('/', express.static(path.join(__dirname, 'public')))

app.post('/upload', upload.single('file'), (req, res, next) => {
  // console.log(req.file)
  res.send('success')
})

app.get('/retrieve', (req, res) => {
  res.send('enter an S3 bucket filename as a parameter in the url to view')
})

app.get('/retrieve/:filename', (req, res) => {
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: req.params.filename,
    Expires: 500
  }
  s3.getSignedUrl('getObject', s3Params, (err, data) => {
    if (!err) {
      const returnData = {
        signedRequest: data,
        url: `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${req.params.filename}`
      }
      if (returnData.url.indexOf('png') > -1) {
        res.send({ value: 'image', url: returnData.url })
      } else {
        console.log(returnData.url)
        axios.get(returnData.url)
             .then(data => {
               res.send({ value: data.data, url: returnData.url })
             })
             .catch(err => console.log(err))
      }
    } else {
      res.json({ success: false, error: err })
    }
  })
})

app.listen(3000, () => { console.log('listening on 3000') })
