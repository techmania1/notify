var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var voice_cb_url = 'http://techmania.systems/api/twillioVoiceCb';
//var status_cb_url = 'http://techmania.systems/api/twillioStatusCb';
var status_cb_url = 'http://requestb.in/14e9tb51'; // TODO remove
// schema
var boomiSchema = new Schema({
  msg_id: { type: String, required: true },
  user_id: { type: String, required: true },
  from_phone: { type: String, required: true, default: '+19722036643' },
  to_phone: { type: String, required: true },
  msg: { type: String, required: false },
  sip: { type: String, required: false },
  twillio_voice_cb_url: { type: String, required: false, default: voice_cb_url },
  twillio_status_cb_url: { type: String, required: false, default: status_cb_url }
},{ _id : false });

// model
var Boomi = mongoose.model('Boomi', boomiSchema);

// export
module.exports = Boomi;
