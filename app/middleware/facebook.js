const request = require('request');
const token = process.env.FB_PAGE_ACCESS_TOKEN;

exports.sendQuickReply = (sender, messageItem, options) => {
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
}

exports.sendTextMessage = (sender, text) => {
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