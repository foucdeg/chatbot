var chatService = require('../server/chatService');
var authenticate = chatService.authenticate;
var sendTextMessage = chatService.sendTextMessage;

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

router.post('/', function (req, res) {
  var data = req.body;

  if (data.object === 'page') {

    data.entry.forEach(function(entry) {

      entry.messaging.forEach(function(event) {
        if (event.message) {
          sendTextMessage(event.sender.id, event.message.text);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    res.sendStatus(200);
  }
});

module.exports = router;
