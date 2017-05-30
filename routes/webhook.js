var authenticate = require('../server/chatService').authenticate;
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (authenticate(req))
  {
    res.status(200).send(req.query['hub.challenge']);
  }
  else {
    res.sendStatus(403); 
  }
});

module.exports = router;
