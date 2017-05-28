const fb = require('../middleware/facebook.js');
const State = require('../models/state.js');
const User = require('../models/user.js');

exports.handleState = (message, senderId, stage) => {
	let update = {};
	if(!stage.name && message) {
		if (message.length > 255) {
			fb.sendTextMessage(`Seems like you entered invalid input. Please enter the first and last name.`);
			return;
		}
		update = { name: message };
		updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'name');
			const replyOptions = {
				Yes : 'IN_US',
				No : 'NOT_IN_US',
			};
			const message = `Do you live in the United States?`;
			fb.sendQuickReply(senderId, message, replyOptions);
		}).catch((error) => { console.log(`Error updating user name: ${JSON.stringify(error)}`); });

	} else if(!stage.address) {
		update = { address: message };
		updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'address');
			query = { fb_id: senderId };
			User.findOne(query, (error, result) => {
				if (error) {
					console.log(`Recieved finding user ${JSON.stringify(error)}`);
					return;
				}

				if(result.isInternational === true) {
					fb.sendTextMessage('Please enter your comment below.');
				} else {
					fb.sendTextMessage('Enter the city you reside in.');
				}
			});			
		}).catch((error) => { console.log(`Error updating user address: ${JSON.stringify(error)}`); });

	} else if(!stage.city) {
		update = { city: message };
		updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'city');
			fb.sendTextMessage('Enter the state you reside in.');
		}).catch((error) => { console.log(`Error updating user city: ${JSON.stringify(error)}`); });

	} else if(!stage.state) {
		update = { state: message };
		updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'state');
			fb.sendTextMessage('Enter your zip code.');
		}).catch((error) => { console.log(`Error updating user state: ${JSON.stringify(error)}`); });

	} else if(!stage.zip && message) {
		if(!isValidZip(message)) {
			fb.sendTextMessage(`I'm sorry we only support US addresses with 5 digit zip codes.`);
			return;
		}
		update = { zip: message };
		updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'zip');
			fb.sendTextMessage('');
		}).catch((error) => { console.log(`Error updating user zip: ${JSON.stringify(error)}`); });
	} else if(!stage.comment) {
		update = { comment: message };
		updateUser(senderId, update)
		.then((result) => {
			exports.updateState(senderId, 'comment');
			fb.sendTextMessage('Please enter your comment below.');
		}).catch((error) => { console.log(`Error updating user zip: ${JSON.stringify(error)}`); });

	} else {

	}

}

function isValidZip(zip) {
	if(zip.length > 5 || isFinite(zip) || (parseInt( myInteger ) < 0)) {
		return false;
	}
	return true;
}

exports.updateState = (senderId, stateName) => {
	const query = { fb_id: senderId };
	let update = {};
	update[stateName] = true;
    const options = { upsert: true,
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
		console.log(`Removed state: ${result}`);
	});
}

exports.updateUser = (senderId, updateFields) => {
	const query = {fb_id: senderId}
	const options = { upsert: true, new: true, 
					  setDefaultsOnInsert: true 
					};
	return User.findOneAndUpdate(query, updateFields, options).exec();
}