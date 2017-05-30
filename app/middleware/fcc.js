const constants = require('../../config/constants.js');
const rp = require('request-promise');
const User = require('./user.js');
const token = process.env.FCC_DATA_TOKEN;

exports.sendComment = (senderId) => {
	User.findOne({ fb_id: senderId }, (error, user) => {
		if(error) {
			console.log(`Error encountered getting state: ${JSON.stringify(error)}`);
			return;
		}
		console.log(`User is ${user}`);
		const requestData = {
			documents: [],
			proceedings: contants.proceeding,
			filers:[ {name: user.name}],
			authors: [],
			bureaus: [],
			lawfirms: [],
			text_data: user.comment,
			express_comment: 1
		}
		if(user.isInternational) {
			requestData.internationaladdressentity = {
				addresstext: user.address,
			}
		}
		else {
			requestData.addressentity = {
				address_line_1: user.address,
				city: user.city,
				state: user.state,
				zip_code: user.zip
			}
		}

		const options = {
			method: 'POST'
			url: 'https://publicapi.fcc.gov/ecfs/filings',
			qs: {api_key:token},
			headers: {
        		'content-type': 'application/json'
    		},
    		json: requestData
		}

		return rp(options);
	}); 
}