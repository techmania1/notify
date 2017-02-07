var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// schema
var userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  sms_enabled: { type: Boolean, required: true }
});

// model
var User = mongoose.model('User', userSchema);

// export
module.exports = User;
