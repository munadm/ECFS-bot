const handler = require('../models/handler.js');
const token = process.env.FB_PAGE_ACCESS_TOKEN;

// For Facebook verification
exports.tokenVerification = function(req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge']);
  } else {
  	res.send('Error, wrong validation token');
  }
}

// Main webhook handler
exports.handleMessage = function (req, res) {
	const data = req.body;
 	if (data.object == 'page') {
 		data.entry.forEach( (pageEntry) => {
 			let pageID = pageEntry.id;
 			let timeOfEvent = pageEntry.time;
 			pageEntry.messaging.forEach((event) => {
 				console.log(JSON.stringify(event));
 				let senderId = event.sender.id;
 				if (event.message && event.message.quick_reply) {
 					console.log("At Quick Reply handler");
 					handler.quickReplyHandler(event,senderId);
 				} else if (event.message) {
 					handler.messageHandler(event,senderId);
 				} else if (event.postback) {
 					handler.postbackHandler(event,senderId);
 				} else {
 					console.log(`Received unexpected event ${JSON.stringify(event)}`);
 				}
 			})
 		});
 	}
    res.sendStatus(200);
};