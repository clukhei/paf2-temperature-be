const express = require("express");
const app = express();
const router = express.Router();
const { Timestamp } = require("mongodb");
const mongoClient = require("./mongoClient");
const path = require("path");

const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const fs = require("fs");
const hbs = require("express-handlebars");
app.engine("hbs", hbs({ defaultLayout: "default.hbs" }));
app.set("view engine", "hbs");

const AWS_S3_HOSTNAME = process.env.AWS_S3_HOSTNAME;
const AWS_S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY;
const AWS_S3_SECRET_ACCESSKEY = process.env.AWS_S3_SECRET_ACCESSKEY;
const AWS_S3_BUCKETNAME = process.env.AWS_S3_BUCKETNAME;

const spaceEndPoint = new AWS.Endpoint(AWS_S3_HOSTNAME);
const s3 = new AWS.S3({
	endpoint: spaceEndPoint,
	accessKeyId: AWS_S3_ACCESS_KEY,
	secretAccessKey: AWS_S3_SECRET_ACCESSKEY,
});

const multipart = multer({ dest: path.join(__dirname, "uploads") });

const readFilePromise = (path) => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, imgFile) => {
			if (err) reject(err);
			else resolve(imgFile);
		});
	});
};

const putObjPromise = (filename, imgFile) => {
	const params = {
		Bucket: AWS_S3_BUCKETNAME,
		Key: filename, //req.file.filename,
		Body: imgFile,
		ACL: "public-read",
	};
	return new Promise((resolve, reject) => {
		s3.putObject(params, (error, result) => {
			if (error) reject(error);
			else resolve(result);
		});
	});
};

router.post("/temperature", multipart.single("imgFile"), async (req, res) => {
	console.log("hello");
	//clean up res.on can be perform anypart of the code.
	res.on("finish", () => {
		//delete the temp file
		fs.unlink(req.file.path, () => {
			console.log("deleted uploads file");
		});
	});
	try {
		const imgFile = await readFilePromise(req.file.path);
		const uploadResult = await putObjPromise(req.file.filename, imgFile);
		const doc = mkTemperature(req.body, req.file.filename);
		const result = await mongoClient
			.db(DATABASE)
			.collection(COLLECTION)
			.insertOne(doc);

		res.status(200);
		res.type("application/json");
		res.json(result);
	} catch (e) {
		console.log(e);
		res.status(500);
		res.type("application/json");
		res.json(e);
	}
});

const DATABASE = "take-temp-together";
const COLLECTION = "temperature";
const mkTemperature = (params, fileName) => {
	return {
		ts: new Date() /* Timestamp.fromNumber(new Date().getTime()) */,
		user: params.userName,
		q1: params.q1 == "true" ? true : false,
		q2: params.q2 == "true" ? true : false,
		temperature: parseFloat(params.temperature),
		image: fileName,
	};
};
const mkManyTemperature = (params) => {};

router.get("/temp/:name", async (req, res) => {
	const name = req.params["name"];
	let result = await mongoClient
		.db(DATABASE)
		.collection(COLLECTION)
		.find({
			user: {
				$regex: name,
				$options: "i",
			},
			image: {$exists:true}
		})
		.toArray();
		result = result.map((i) => {
		i.image =  process.env.DIGIOCEAN_HOST + i.image ;
		return i 
	});

	console.log(result);
	res.status(200);
	res.type("text/html");
	res.render("temp", { data: result, hasData: result.length > 0, name });
});

module.exports = router;
