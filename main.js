const express = require('express')
const morgan = require('express')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const mongoClient = require('./mongoClient')
const { ObjectId, MongoClient, Timestamp } = require("mongodb");
const bodyParser = require('body-parser')
const apiRouter = require('./api')

require('dotenv').config()

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({limit:'50mb', extended:true}))
app.use(bodyParser.json({limit: '50mb'}))

const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000

app.use('/api', apiRouter)






mongoClient
    .connect()
    .then(()=> {
        app.listen(PORT, ()=> {
            console.log(`${PORT} started`)
        })
    })
    .catch(e=> console.error("cannot connect to mongo", e))

    