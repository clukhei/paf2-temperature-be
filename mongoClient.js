const {MongoClient} = require('mongodb')
require('dotenv').config()
const mongoClient = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser:true,
    useUnifiedTopology: true
})

module.exports = mongoClient

