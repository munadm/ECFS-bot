const rp = require('request-promise');
const fb = require('../middleware/facebook.js');
const User = require('../models/user.js');
const token = process.env.FB_PAGE_ACCESS_TOKEN;

exports.initializeConversation = (senderId) => {
	const replyOptions = {
		Yes : 'CORRECT_NAME',
		No : 'INCORRECT_NAME',
	};
	fb.sendTextMessage(senderId, 'Welcome! Let\'s get started with some basic information.');
	getUserInformation(senderId)
		.then((response) => { 
			const userInfo = JSON.parse(response);
			const message = `Your name is ${userInfo.first_name} ${userInfo.last_name}. Is that correct?`;
			fb.sendQuickReply(senderId, message, replyOptions);
	      }) 
    	.catch((error) => { 
      		console.log(`Error getting userInfo messages: ${error}`); 
    	});
};

exports.nameIsCorrect = (senderId) => {
	getUserInformation(senderId)
		.then((response) => { 
			const userInfo = JSON.parse(response);
			const query = { fb_id: senderId };
			const update = { first_name: userInfo.first_name,
							 last_name: userInfo.last_name, };
    		const options = { upsert: true,
    						  new: true,
    						  setDefaultsOnInsert: true };
    		User.findOneAndUpdate(query, update, options, (error, result) => {
    			if (error) {
    				console.log(`Recieved error,creating or updating model ${JSON.stringify(error)}`);
    				return;
    			}
    			console.log(`${result}`);
    			fb.sendTextMessage('Great, thanks!');
    		});
	      })
    	.catch((error) => { 
      		console.log(`Error getting userInfo messages: ${error}`); 
    	});
}

exports.nameIsIncorrect = (senderId) => {
	fb.sendTextMessage('Aww Bummer!');
}

function getUserInformation(senderId) {
	const url = `https://graph.facebook.com/v2.6/${senderId}?fields=first_name,last_name&access_token=${token}`;
	return rp(url);
};