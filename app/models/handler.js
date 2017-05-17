const request = require('request');
const rp = require('request-promise');
const token = process.env.FB_PAGE_ACCESS_TOKEN;

exports.messageHandler = (event, senderId) => {
	if (event.message.text) {
		let responseText = event.message.text.substring(0, 200)
		sendTextMessage(senderId, `Text received, echo: ${responseText}`);
	}
}

exports.postbackHandler = (event, senderId) => {
	const payload = event.postback.payload;
	if (payload === 'GET_STARTED_PAYLOAD') {
		sendTextMessage(senderId, 'Welcome! Let\'s get started with some basic information.');
		getUserInformation(senderId)
		.then((userInfo) => { 
			userInfo = JSON.parse(userInfo);
	        sendTextMessage(senderId, `Your name is ${userInfo.first_name} ${userInfo.last_name}. Is that correct?`); 
	      }) 
    	.catch((error) => { 
      		console.log(`Error getting userInfo messages: ${error}`); 
    	});
	}
	else if (payload === 'FAQ_DATA_USE') {
		sendTextMessage(senderId, 'Great Question! Though we are storing your data in order to prepare your comment we will delete it right after you confirm to submit your comment.')
	}
}

function getUserInformation(senderId) {
	const url = `https://graph.facebook.com/v2.6/${senderId}?fields=first_name,last_name&access_token=${token}`;
	return rp(url);
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
		    console.log(`Error sending messages: ${JOSN.stringify(error)}`);
		} else if (response.body.error) {
		    console.log(`Error: ${response.body.error}`);
	    }
    })
}