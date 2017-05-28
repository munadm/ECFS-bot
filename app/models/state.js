const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stateSchema = new Schema({
  fb_id: { type: String, required: true, unique: true },
  name: { type: Boolean, default: false },
  address: { type: Boolean, default: false },
  city: { type: Boolean, default: false },
  state: { type: Boolean, default: false },
  zip: { type: Boolean, default: false },
  comment: {type: Boolean, default: false}
});

const State = mongoose.model('Stage', stateSchema);

module.exports = State;