var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// schema
var msgSchema = new Schema({
  title: { type: String, required: true },
  msg: { type: String, required: true },
  status: { type: String, required: true },
  create_dttm: { type: Date, required: true, default: Date.now },
  smsUsers: [{
        _id: { type: String, required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        status: { type: String, required: false },
        update_dttm: { type: Date, required: false },
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
