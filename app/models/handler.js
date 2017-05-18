const request = require('request');
const rp = require('request-promise');
const token = process.env.FB_PAGE_ACCESS_TOKEN;

exports.messageHandler = (event, senderId) => {
	if (event.message.text) {
		let responseText = event.message.text.substring(0, 200);
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
	} else {
		console.log(`Recieved unexpected payload ${payload}`)
	}
}

exports.quickReplyHandler = (event, senderId) => {
	const payload = event.message.quick_reply.payload;
	console.log(`Sender with id ${senderId} sent payload ${JSON.stringify(payload)}`);
	if(payload === 'CORRECT_NAME') {
		sendTextMessage(senderId, 'Great!');
	}
	else if(payload === 'INCORRECT_NAME') {
		sendTextMessage(senderId, 'Darn :(');
	}
	else {
		console.log(`Recieved unexpected payload ${JSON.stringify(payload)}`)
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

function sendQuickReply(sender, messageItem, options) {
	let optionsData = [];
	for (item in options) {
		optionsData.push({
			content_type : "text",
			title : item,
			payload : options[item],
		});
	}
	console.log('Options data ' + JSON.stringify(optionsData));
	let requestData = {
		recipient: {id:sender},
		message: {
	    		text: messageItem,
	    		quick_replies: optionsData

	    	}
	};
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
	    json: requestData
	}, function(error, response, body) {
		if (error) {
		    console.log(`Error sending messages: ${JOSN.stringify(error)}`);
		} else if (response.body.error) {
		    console.log(`Error: ${JSON.stringify(response.body.error)}`);
	    }
	});
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
		    console.log(`Error sending messages: ${JOSN.stringify(error)}`);
		} else if (response.body.error) {
		    console.log(`Error: ${JSON.stringify(response.body.error)}`);
	    }
    });
}