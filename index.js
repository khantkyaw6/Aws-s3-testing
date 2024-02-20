const express = require('express');
require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const { Readable } = require('stream');

const app = express();
const { PORT, BUCKET_NAME, ACCESS_KEY, SECRET_KEY, REGION } = process.env;

// Set up AWS credentials
const s3Client = new S3Client({
	region: REGION,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_KEY,
	},
});

// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
	console.log(req.file);

	const uploadParams = {
		Bucket: BUCKET_NAME,
		Key: req.file.originalname,
		Body: req.file.buffer, // This is the file object from the frontend
	};

	const upload = new Upload({
		client: s3Client,
		params: uploadParams,
	});

	try {
		upload.on('httpUploadProgress', (progress) => {
			console.log(progress);
		});

		upload.done().then(
			(result) => {
				// console.log(result);
				console.log(result.Location);
			},
			(error) => {
				console.error(error);
			}
		);
		console.log('File uploaded successfully');
		res.status(200).send('File uploaded');
	} catch (error) {
		console.log(error);
		res.status(500).send('Failed to upload file');
	}
});

app.get('/', (_req, res) => {
	res.send('Hello from the server');
});

app.listen(PORT, console.log(`Server is running on PORT ${PORT}`));

// const filePath = './2.jpg';
// const newFileNameKey = 'file.jpg';
// const fileStream = fs.createReadStream(filePath);

// fileStream.on('error', (err) => console.log('Error', err));
