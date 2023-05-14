const axios = require('axios');
const { pick } = require('lodash');
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const bypass = require('./bypass');
const copyHeaders = require('./copyHeaders');

async function proxy(req, res) {
  const url = req.params.url;
  const headers = {
    cookie: req.headers.cookie,
    dnt: req.headers.dnt,
    referer: req.headers.referer,
    'user-agent': 'Bandwidth-Hero Compressor',
    'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
    via: '1.1 bandwidth-hero',
  };
  const config = {
    timeout: 10000,
    maxRedirects: 5,
    responseType: 'arraybuffer',
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  };

  try {
    const response = await axios.get(url, { headers, ...config });
    if (response.status >= 400) {
      return redirect(req, res);
    }

    copyHeaders(response.headers, res);
    res.setHeader('content-encoding', 'identity');
    req.params.originType = response.headers['content-type'] || '';
    req.params.originSize = response.data.length;

    if (shouldCompress(req)) {
      compress(req, res, response.data);
    } else {
      bypass(req, res, response.data);
    }
  } catch (error) {
    redirect(req, res);
  }
}

module.exports = proxy;
