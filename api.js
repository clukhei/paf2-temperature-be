const express = require("express");
const router = express.Router();
const { Timestamp } = require('mongodb')
const mongoClient = require('./mongoClient')
router.get("/submit", (req, res) => {
    
	res.type("application/json");
	res.status(200).json({ message: "success" });
});

router.post("/temperature", async(req, res) => {
    const doc = mkTemperature(req.body);
    const result = await mongoClient
        .db('PAFd2')
        .collection('temperature')
        .insertOne({
           doc
        })
        console.log(result)
  
	res.status(200);
	res.type("application/json");
	res.json(result);
});




const DATABASE = "take-temp-together";
const COLLECTION = "temperature";
const mkTemperature = (params) => {
	return {
		ts: Timestamp.fromNumber(new Date().getTime()),
		user: params.userName,
		q1: params.q1,
		q2: params.q2,
		temperature: params.temperature,
	};
};

module.exports = router;
