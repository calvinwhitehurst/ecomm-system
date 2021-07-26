const rateLimit = require('express-rate-limit')
module.exports = limit = rateLimit({
    max: 30, // max requests
    windowMs: 60 * 60 * 1000, // 1 Hour
    message:
      '<!DOCTYPE html><html><head><title>Body Aware Central</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.3.1/dist/semantic.min.css"><script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.11.8/semantic.min.js"></script><meta name="robots" content="noindex"><style type="text/css">body {background-color: #DADADA;}</style></head><body><div style="margin: 10% auto; width: 50%; text-align: center;" class="ui negative message"><div class="header">Sorry you have used too many attempts to login.</div><p>Please contact the web adminstrator.</p></div></body></html>' // message to send
  })