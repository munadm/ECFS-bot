const request = require('request');
const token = process.env.FB_PAGE_ACCESS_TOKEN;

exports.messageHandler = (event, senderId) => {
	if (event.message.text) {
		let responseText = event.message.text.substring(0, 200)
		sendTextMessage(senderId, `Text received, echo: ${responseText}`);
	}
}

exports.postbackHandler = (event, senderId) => {
	if (event.postback.payload === 'GET_STARTED_PAYLOAD'){
		sendTextMessage(senderId, "Great! To submit your comment we need some information. The information is deleted after you submit your comment.");
	}
}

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
		    console.log(`Error sending messages: ${error}`);
		} else if (response.body.error) {
		    console.log(`Error: ${response.body.error}`);
	    }
    })
}