const _ = require('underscore');
const constants = require('../../config/constants.js');
const cv = require('../models/conversation.js')
const fb = require('../middleware/facebook.js');
const State = require('../models/state.js');
const User = require('../models/user.js');

exports.handleState = (message, senderId, state) => {
	let update = {};
	if(!state.name && message) {
		if (message.length > 255) {
			fb.sendTextMessage(senderId, `Seems like you entered invalid input. Please enter the first and last name.`);
			return;
		}
		update = { name: message };
		exports.updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'name');
			const replyOptions = {
				Yes : 'IN_US',
				No : 'NOT_IN_US',
			};
			const message = `Do you live in the United States?`;
			fb.sendQuickReply(senderId, message, replyOptions);
		}).catch((error) => { console.log(`Error updating user name: ${JSON.stringify(error)}`); });

	} else if(!state.address) {
		update = { address: message };
		exports.updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'address');
			query = { fb_id: senderId };
			User.findOne(query, (error, user) => {
				if (error) {
					console.log(`Recieved finding user ${JSON.stringify(error)}`);
					return;
				}
				console.log(`Result is: ${user}`);

				if(user.isInternational === true) {
					fb.sendTextMessage(senderId, 'Please enter your comment below.');
				} else {
					fb.sendTextMessage(senderId, 'Enter the city you reside in.');
				}
			});			
		}).catch((error) => { console.log(`Error updating user address: ${JSON.stringify(error)}`); });

	} else if(!state.city) {
		update = { city: message };
		exports.updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'city');
			fb.sendTextMessage(senderId, 'Enter the state you reside in, using the abbreviated form (ex. CA for California).');
		}).catch((error) => { console.log(`Error updating user city: ${JSON.stringify(error)}`); });

	} else if(!state.state && message) {
		message = message.toUpperCase();
		if(!isValidState(message)) {
			fb.sendTextMessage(senderId, `I'm sorry we only support US addresses with 5 digit zip codes.`);
			return;
		}
		update = { state: message };
		exports.updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'state');
			fb.sendTextMessage(senderId, 'Enter your zip code.');
		}).catch((error) => { console.log(`Error updating user state: ${JSON.stringify(error)}`); });

	} else if(!state.zip && message) {
		if(!isValidZip(message)) {
			fb.sendTextMessage(senderId, `I'm sorry we only support US addresses with a 5 digit zip code.`);
			return;
		}
		update = { zip: message };
		exports.updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'zip');
			fb.sendTextMessage(senderId, 'Enter your comment below.');
		}).catch((error) => { console.log(`Error updating user zip: ${JSON.stringify(error)}`); });
	} else if(!state.comment) {
		update = { comment: message };
		exports.updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'comment');
			cv.finalizeConversation(senderId);
		}).catch((error) => { console.log(`Error updating user zip: ${JSON.stringify(error)}`); });

	} else {
		fb.sendTextMessage(senderId, 'We ran into some issues processing your input. Please try again.');
	}
}

function isValidState(state) {
	if(state.length > 2) {
		return false;
	}
	if(!(_.contains(constants.states, state)) ) {
		return false;
	}
	return true;
}

function isValidZip(zip) {
	if(zip.length > 5 || !isFinite(zip) || (parseInt(zip) < 0)) {
		return false;
	}
	return true;
}

exports.updateState = (senderId, stateName) => {
	const query = { fb_id: senderId };
	let update = {};
	update[stateName] = true;
    const options = { upsert: true,
    				  new: true,
    				  setDefaultsOnInsert: true };
    State.findOneAndUpdate(query, update, options, (error, result) => {
		if (error) {
			console.log(`Recieved error,creating or updating state ${JSON.stringify(error)}`);
			return;
		}
		console.log(`Updated state: ${result}`);
    });
}

exports.clearState = (senderId) => {
	const query = { fb_id: senderId };
	State.findOneAndRemove(query, (error, result) => {
		if (error) {
			console.log(`Recieved error,removing state ${JSON.stringify(error)}`);
    		return;
		}
		console.log(`Removed state: ${senderId}`);
	});
}

exports.updateUser = (senderId, updateFields) => {
	const query = {fb_id: senderId}
	const options = { upsert: true, new: true, 
					  setDefaultsOnInsert: true 
					};
	return User.findOneAndUpdate(query, updateFields, options).exec();
}