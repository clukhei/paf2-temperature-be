const express = require('express')
const morgan = require('express')

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






const p0 = new Promise(
    (resolve,reject) => {
        if(!!process.env.AWS_S3_ACCESS_KEY && !!process.env.AWS_S3_SECRET_ACCESSKEY)
            resolve()
            else 
                reject(`S3 keys not found`)
    }
)
const p1 = mongoClient.connect()

Promise.all([p0,p1])
    .then(()=> {
        app.listen(PORT, ()=> {
            console.log(`${PORT} started`)
        })
    }).catch(e=> console.error("cannot connect to mongo", e))

    