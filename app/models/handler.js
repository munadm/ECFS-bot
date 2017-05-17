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
			InitializeConversation(senderId, userInfo);
	      }) 
    	.catch((error) => { 
      		console.log(`Error getting userInfo messages: ${error}`); 
    	});
	}
	else if (payload === 'FAQ_DATA_USE') {
		sendTextMessage(senderId, 'Great Question! Though we are storing your data in order to prepare your comment we will delete it right after you confirm to submit your comment.')
	}
	else if(payload === 'CORRECT_NAME') {
		sendTextMessage(senderId, 'Great!');
	}
	else if(payload === 'INCORRECT_NAME') {
		sendTextMessage(senderId, 'Darn :(');
	}
}

function InitializeConversation(userInfo, senderId) {
	const replyOptions = {
		yes : 'CORRECT_NAME',
		no : 'INCORRECT_NAME',
	};
	const message = `Your name is ${userInfo.first_name} ${userInfo.last_name}. Is that correct?`;
	sendQuickReply(senderId, message, replyOptions);
}

function getUserInformation(senderId) {
	const url = `https://graph.facebook.com/v2.6/${senderId}?fields=first_name,last_name&access_token=${token}`;
	return rp(url);
}

function sendQuickReply(sender, title, options) {
	let optionsData = [];
	for (item in options) {
		optionsData.push({
			content_type : "text",
			title : item,
			payload : options[item],
		});
	}
	console.log(JSON.stringify(optionsData));
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
	    json: {
	    	recipient: {id:sender},
	    	message: {
	    		text: title,
	    		quick_replies: optionsData

	    	}
	    }
	}, function(error, response, body) {
		if (error) {
		    console.log(`Error sending messages: ${JOSN.stringify(error)}`);
		} else if (response.body.error) {
		    console.log(`Error: ${response.body.error}`);
	    }
	});
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
    });
}