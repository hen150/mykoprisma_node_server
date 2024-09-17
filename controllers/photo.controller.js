const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { format } = require('date-fns');
const express = require('express');
const bodyParser = require('body-parser');
const cv = require('opencv4nodejs');

const app = express();
const rootDir = '/var/www/html/assets/run4';
const failedDir = path.join(rootDir, 'failed');

app.use(bodyParser.json({ limit: '500mb' }));

async function set(req, res) {
    console.log('Received a POST request to /setPhoto from IP:', req.ip || req.connection.remoteAddress);

    if (!req.body || !Buffer.isBuffer(req.body)) {
        console.error('Empty or invalid request body');
        return res.status(400).send('Invalid image data');
    }

    try {
        const image = await loadImage(Buffer.from(req.body));
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height);

        const src = cv.imdecode(Buffer.from(req.body));
        const detectionResult = detectAndDrawMushroom(src, ctx);

        if (!detectionResult) {
            console.log('No mushrooms detected. Image is considered a failed image.');
            const timestamp = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
            saveFailedImage(image, timestamp, 'no_mushroom');
            return res.status(400).send('Image rejected due to no detected mushrooms.');
        }

        const timestamp = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
        saveProcessedImage(canvas, timestamp, 'newest.jpg');
        saveUniqueImage(canvas, new Date().getTime());

        res.status(200).json({ message: 'Image processed successfully', radius: detectionResult.radius });
    } catch (error) {
        console.error('Failed to process image:', error);
        return res.status(400).send('Failed to process image');
    }
}

function detectAndDrawMushroom(src, ctx) {
    const gray = src.bgrToGray();
    const blurred = gray.gaussianBlur(new cv.Size(5, 5), 1.5);
    const edges = blurred.canny(50, 150);
    const contours = edges.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    if (contours.length > 0) {
        const largestContour = contours.sort((c1, c2) => c2.area - c1.area)[0];
        const { center, radius } = largestContour.minEnclosingCircle();

        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 3;
        ctx.stroke();

        console.log(`Detected mushroom with radius: ${radius.toFixed(2)} pixels`);
        return { center, radius: radius.toFixed(2) };
    }

    return null;
}

function saveProcessedImage(canvas, timestamp, filename) {
    const latestFilePath = path.join(rootDir, filename);
    const out = fs.createWriteStream(latestFilePath);
    const stream = canvas.createJPEGStream({ quality: 1 });

    stream.pipe(out);
    out.on('finish', () => console.log('Processed image saved:', latestFilePath));
    out.on('error', (error) => console.error('Failed to save processed image:', error));
}

function saveUniqueImage(canvas, uniqueId) {
    const uniqueFilePath = path.join(rootDir, `image_${uniqueId}.jpg`);
    const uniqueOut = fs.createWriteStream(uniqueFilePath);
    const uniqueStream = canvas.createJPEGStream({ quality: 0.5 });

    uniqueStream.pipe(uniqueOut);
    uniqueOut.on('finish', () => console.log('Unique image saved:', uniqueFilePath));
    uniqueOut.on('error', (error) => console.error('Failed to save unique image:', error));
}

function saveFailedImage(image, timestamp, reason) {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);

    const failedFilePath = path.join(failedDir, `${timestamp}_failed_${reason}.jpg`);
    const failedOut = fs.createWriteStream(failedFilePath);
    const failedStream = canvas.createJPEGStream({ quality: 1 });

    failedStream.pipe(failedOut);
    failedOut.on('finish', () => console.log('Failed image saved:', failedFilePath));
    failedOut.on('error', (error) => console.error('Failed to save failed image:', error));
}

module.exports = {
    set
};
