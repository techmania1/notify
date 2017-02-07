var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// schema
var boomiSchema = new Schema({
  msg_id: { type: String, required: true },
  user_id: { type: String, required: true },
  from_phone: { type: String, required: true, default: '+19722036643' },
  to_phone: { type: String, required: true },
  msg: { type: String, required: false },
  sip: { type: String, required: false },
  twillio_voice_cb_url: { type: String, required: false, default: 'http://techmania.systems/api/twillioVoiceCb' },
  twillio_status_cb_url: { type: String, required: false, default: 'http://techmania.systems/api/twillioStatusCb' }
},{ _id : false });

// model
var Boomi = mongoose.model('Boomi', boomiSchema);

// export
module.exports = Boomi;
