const State = require('../models/state.js');
const fb = require('../middleware/facebook.js')
const cv = require('./conversation.js');
const sh = require('../controllers/stateHandler.js');

exports.messageHandler = (event, senderId) => {
	if (event.message.text) {
		State.findOne({ fb_id: senderId }, (error, state) => {
			if(error) {
				console.log(`Error encountered getting state: ${JSON.stringify(error)}`);
				return;
			}
			if(state) {
				sh.handleState(event.message.text, senderId, stage);
			} else {
				cv.initializeConversation(senderId);
			}
		}); 
		// let responseText = event.message.text.substring(0, 200);
		// fb.sendTextMessage(senderId, `Text received, echo: ${responseText}`);
	}
}

exports.postbackHandler = (event, senderId) => {
	const payload = event.postback.payload;
	if (payload === 'GET_STARTED_PAYLOAD') {
		cv.initializeConversation(senderId);
	} else if (payload === 'FAQ_DATA_USE') {
		fb.sendTextMessage(senderId, 'Great Question! Though we are storing your data in order to prepare your comment we will delete it right after you confirm to submit your comment.')
	} else {
		console.log(`Recieved unexpected payload ${payload}`)
	}
}

exports.quickReplyHandler = (event, senderId) => {
	const payload = event.message.quick_reply.payload;
	console.log(`Sender with id ${senderId} sent payload ${JSON.stringify(payload)}`);
	if(payload === 'CORRECT_NAME') {
		cv.nameIsCorrect(senderId);
	} else if(payload === 'INCORRECT_NAME') {
		cv.nameIsIncorrect(senderId);
	} else if(payload === 'IN_US') {
		cv.userInUS(senderId);
	} else if(payload === 'IN_US') {
		cv.userNotInUS(senderId);
	} else {
		console.log(`Recieved unexpected payload ${JSON.stringify(payload)}`)
	}
}

