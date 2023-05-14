function redirect(req, res) { 
  res.setHeader('location', encodeURI(req.params.url))
    .removeHeader('cache-control')
    .removeHeader('expires')
    .removeHeader('date')
    .removeHeader('etag')
    .status(302)
    .end()
  return
}

module.exports = redirect
