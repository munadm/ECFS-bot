const request = require('request');
const token = process.env.FB_PAGE_ACCESS_TOKEN;

// For Facebook verification
exports.tokenVerification = function(req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge']);
  } else {
  	res.send('Error, wrong validation token');
  }
}

// Base echo route
exports.handleMessage = function (req, res) {
	console.log(req.body.entry[0]);
	let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = messaging_events[i];
	    let sender = event.sender.id;
	    if (event.message && event.message.text) {
		    let text = event.message.text;
		    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
	    }
    }
    res.sendStatus(200);
};

function sendTextMessage(sender, text) {
    let messageData = { text:text };
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
		    console.log('Error sending messages: ', error);
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error);
	    }
    })
}