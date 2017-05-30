const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fb_id: { type: String, required: true, unique: true },
  name: String,
  address: String,
  zip: { type: String, maxlength: 9 },
  city: String,
  state: { type: String, maxlength: 2 },
  isInternational: { type: Boolean, default: false },
  created_at: Date,
  updated_at: Date
});

var User = mongoose.model('User', userSchema);

userSchema.pre('update', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

// make this available to our users in our Node applications
module.exports = User;