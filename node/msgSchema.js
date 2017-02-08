var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// schema
var msgSchema = new Schema({
  title: { type: String, required: true },
  msg: { type: String, required: true },
  status: { type: String, required: true, default: 'active' },
  create_dttm: { type: Date, required: true, default: Date.now },
  smsUsers: [{
        _id: { type: String, required: true },
        sid: { type: String, required: false },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        status: { type: String, required: false },
        update_dttm: { type: Date, required: false, default: Date.now },
        sms_enabled: { type: Boolean, required: true },
        response: { type: String, required: false }
        /*user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }*/
    }],
    voiceUsers: [{
          _id: { type: String, required: true },
          sid: { type: String, required: false },
          name: { type: String, required: true },
          phone: { type: String, required: true },
          status: { type: String, required: true },
          update_dttm: { type: Date, required: true, default: Date.now },
          sms_enabled: { type: Boolean, required: true },
          response: { type: String, required: false }
          /*user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true
          }*/
      }],
});

// model
var Msg = mongoose.model('Msg', msgSchema);

// export
module.exports = Msg;
