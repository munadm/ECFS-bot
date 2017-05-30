const rp = require('request-promise');
const fb = require('../middleware/facebook.js');
const sh = require('../controllers/stateHandler.js');
const State = require('./state.js');
const User = require('./user.js');
const token = process.env.FB_PAGE_ACCESS_TOKEN;

exports.initializeConversation = (senderId) => {
	const replyOptions = {
		Yes : 'CORRECT_NAME',
		No : 'INCORRECT_NAME',
	};
	sh.clearState(senderId);
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

exports.finalizeConversation = (senderId) => {
	fcc.sendComment(senderId)
		.then((response) => {
			console.log(`Response from FCC API is: ${response}`);
			if(response.status && response.status === 'RECEIVED') {
				fb.sendTextMessage(senderId, 'Looks like you\'re all set! Thank you for participating!');
			} else {
				fb.sendTextMessage(senderId, 'Looks like something went wrong trying to submit. You can still send a comment here: https://www.fcc.gov/ecfs/search/proceedings?q=name:((17-108))');
			}
			const query = { fb_id: senderId };
			User.findOneAndRemove(query, (error, result) => {
				if (error) {
					console.log(`Recieved error,removing user ${JSON.stringify(error)}`);
	    			return;
				}
				console.log(`Removed user: ${senderId}`);
			});
		})
		.catch((error) => { 
      		console.log(`Error sending comment to fcc messages: ${error}`); 
    	});
}

exports.restartConversation = (senderId) => {
	const query = { fb_id: senderId };
	User.findOneAndRemove(query, (error, result) => {
		if (error) {
			console.log(`Recieved error,removing user ${JSON.stringify(error)}`);
			return;
		}
		console.log(`Removed user: ${senderId}`);
		State.findOneAndRemove(query, (error, state) => {
			if(error) {
				console.log(`Error encountered getting state: ${JSON.stringify(error)}`);
				return;
			}
			console.log(`Removed state: ${senderId}`);
			exports.initializeConversation(senderId);
		}); 
	});
}

exports.nameIsCorrect = (senderId) => {
	const replyOptions = {
		Yes : 'IN_US',
		No : 'NOT_IN_US',
	};
	getUserInformation(senderId)
		.then((response) => {
			const userInfo = JSON.parse(response);
			const userName = userInfo.first_name + ' ' + userInfo.last_name;
			const update = { name: userName };
    		sh.updateUser(senderId, update).then((result) =>{
    			sh.updateState(senderId, 'name');
    			const message = `Do you live in the United States?`;
				fb.sendQuickReply(senderId, message, replyOptions);
    		})
    		.catch((error) => {
    			console.log(`Recieved error,creating or updating model ${JSON.stringify(error)}`);
    		});
	      })
    	.catch((error) => { 
      		console.log(`Error getting userInfo messages: ${error}`); 
    	});
}

exports.nameIsIncorrect = (senderId) => {
	fb.sendTextMessage(senderId, 'Please enter your first name and last name.');
}

exports.userInUS = (senderId) => {
	fb.sendTextMessage(senderId, 'Enter your street address, don\'t enter city, state and zip.');
}

exports.userNotInUS = (senderId) => {
	const update = { isInternational: true };
	sh.updateUser(senderId, update).then((result) =>{
		sh.updateState(senderId, 'city');
		sh.updateState(senderId, 'state');
		fb.sendTextMessage(senderId, 'Enter your full address.');
	})
	.catch((error) => {
		console.log(`Recieved error,creating or updating model ${JSON.stringify(error)}`);
	});
}

function getUserInformation(senderId) {
	const url = `https://graph.facebook.com/v2.6/${senderId}?fields=first_name,last_name&access_token=${token}`;
	return rp(url);
};