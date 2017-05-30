var chatService = require('../server/chatService');
var userService = require('../server/userService');
var authenticate = chatService.authenticate;
var sendTextMessage = chatService.sendTextMessage;
var request = require('request-promise');
var exec = require('child_process').exec;

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

router.post('/', function (req, res, next) {
  var data = req.body;

  if (data.object === 'page') {

    data.entry.forEach(function(entry) {

      entry.messaging.forEach(function(event) {
        var senderId = event.sender.id;
        if (event.message) {
          if (userService.isUserKnown(senderId)) {
            if (event.message.text == parseInt(event.message.text)) {
              exec("../node_modules/foodcommander/bin/foodcom store -p " + event.message.text, function(error, stdout, stderr) {
                sendTextMessage(senderId, stdout)
              });
            }
            else sendTextMessage(senderId, event.message.text);
          }
          else {
            request(
              'https://graph.facebook.com/v2.6/' + senderId +
              '?fields=first_name&access_token='
              + process.env.MESSENGER_PAGE_ACCESS_TOKEN
            ).then(function(result) {
              var senderName = JSON.parse(result).first_name;
              sendTextMessage(senderId, 'Welcome, ' + senderName);
              userService.addUser(senderId, { name: senderName });
            })
            .catch(function(err) {
              console.error("Facebook API error: ", err);
            });
          }
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    res.sendStatus(200);
  }
});

module.exports = router;
