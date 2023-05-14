const sharp = require('sharp');
const cache = require('node-cache'); // or any other caching library
const redirect = require('./redirect');

const imageCache = new cache({ stdTTL: 60 * 60 * 24 }); // cache TTL set to one day

async function compress(req, res, input) {
  const format = req.params.webp ? 'webp' : 'jpeg';
  const key = `${input}:${format}:${req.params.grayscale}:${req.params.quality}`;

  let compressedImageBuffer = imageCache.get(key);

  if (!compressedImageBuffer) {
    const image = sharp(input).grayscale(req.params.grayscale);
    image.toFormat(format, {
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true,
    });

    compressedImageBuffer = await image.toBuffer();
    imageCache.set(key, compressedImageBuffer);
  }

  res.setHeader('content-type', `image/${format}`);
  res.setHeader('content-length', compressedImageBuffer.length);
  res.setHeader('x-original-size', req.params.originSize);
  res.setHeader(
    'x-bytes-saved',
    req.params.originSize - compressedImageBuffer.length
  );
  res.status(200);
  res.write(compressedImageBuffer);
  res.end();
}
