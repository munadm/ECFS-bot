const request = require('request');
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
		var userInfo = getUserInformation(senderId);
		console.log(senderId);
		console.log(userInfo);
		sendTextMessage(senderId, `Your name is ${userInfo.first_name} ${userInfo.last_name}. Is that correct?`);
	}
	else if (payload === 'FAQ_DATA_USE') {
		sendTextMessage(senderId, 'Great Question! Though we are storing your data in order to prepare your comment we will delete it right after you confirm to submit your comment.')
	}
}

function getUserInformation(senderId) {
	const url = `https://graph.facebook.com/v2.6/${senderId}?fields=first_name,last_name&access_token=${token}`;
	request(url, function (error, response, body) {
  		if (!error && response.statusCode == 200) {
  			let str = JSON.stringify(response);
			str = JSON.stringify(response, null, 4); // (Optional) beautiful indented output.
			console.log("Response is " + str);
    		return response;
  		}
  		else {
  			console.log(`Error recieved: ${error}`);
  		}
	});
}

function sendTextMessage(sender, text) {
    let messageData = { text:text };
    var userInfo = getUserInformation(sender);
		console.log("SenderID " + sender);
		console.log(userInfo);
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