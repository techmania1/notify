var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('./node/userSchema');
var Msg = require('./node/msgSchema');
var Boomi = require('./node/boomiSchema');
var XMLWriter = require('xml-writer');
var app = express();

app.set('port', (process.env.PORT || 3000));
app.set('etag', false);
mongoose.connect('mongodb://localhost/notifydb');
mongoose.Promise = global.Promise; // to suppress error
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Set headers on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');

    // application/json
    res.setHeader('Content-Type', 'application/json');
    next();
});


/******************************
 * Misc
 ******************************/

// https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications

// drop all users
app.delete('/api/dropAllUsers', function(req, res) {
  try {
    console.log("dropping all users!");
    User.collection.drop();
    res.end();
  } catch(err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// drop all messages
app.delete('/api/dropAllMessages', function(req, res) {
  try {
    console.log("dropping all messages!");
    Msg.collection.drop();
    res.end();
  } catch(err) {
    console.log(err);
    res.status(500).json(err);
  }
});

/******************************
 * User
 ******************************/

// get all users
app.get('/api/users', function(req, res) {
  User.find({}, function(err, user) {
    if(err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      console.log(user);
      res.json(user);
    }
  });
});

// get user by id
app.get('/api/userById/:id', function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if(err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      console.log(user);
      res.json(user);
    }
  });
});

// save user
app.post('/api/user', function(req, res) {
  var user = new User({
    name: req.body.name,
    phone: req.body.phone,
    sms_enabled: req.body.sms_enabled
  });
  user.save(function(err, user) {
    if(err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      console.log(user);
      res.json(user);
    };
  });
});

// update user - to return the updated value pass {new : true}
app.put('/api/user/:id', function(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body,
        {new : true}, function(err, user) {
      if(err) {
        console.log(err);
        res.status(500).json(err);
      } else {
        console.log(user);
        res.json(user);
      };
  });
});

// delete user
app.delete('/api/user/:id', function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
      if(err) {
        console.log(err);
        res.status(500).json(err);
      } else {
        console.log(user);
        res.json(user);
      }
  });
});


/******************************
 * Msg
 ******************************/

 // get all msg
 app.get('/api/msg', function(req, res) {
   Msg.find({}, function(err, msg) {
     if(err) {
       console.log(err);
       res.status(500).json(err);
     } else {
       console.log(msg);
       res.json(msg);
     }
   }).sort({create_dttm: 'descending'});
 });

 // send msg
app.post('/api/send', function(req, res) {
  // pre-populate voiceUsers and smsUsers arrays
  var arrVoiceUsers = [];
  var arrSmsUsers = [];
  req.body.users.forEach(function(user) {
    var data = {
      status: 'queued',
      update_dttm: Date.now(),
      _id: user._id,
      name: user.name,
      phone: user.phone,
      sms_enabled: user.sms_enabled,
      response: '',
      sid: ''
    };
    arrVoiceUsers.push(data);
    if(user.sms_enabled==true){
      arrSmsUsers.push(data);
    }
  });

  var msg = new Msg({
    title: req.body.title,
    msg: req.body.msg,
    status: 'active',
    create_dttm: Date.now(),
    voiceUsers: arrVoiceUsers,
    smsUsers: arrSmsUsers
  });
  msg.save(function(err, msg) {
    if(err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      // TODO send notification, then pass callback function (sendCallback) to save twillio sid
      console.log(msg);
      res.json(msg);
    };
  });
});

// non-boomi
app.get('/api/voice', function(req, res) {
  var DATA_FILE = path.join(__dirname, '/public/new_voice.json');
  res.sendFile(DATA_FILE);
});

app.post('/api/voice', function(req, res) {
  console.log(req.body); // TODO remove
  res.json(req.body);
});

app.get('/api/sms', function(req, res) {
  var DATA_FILE = path.join(__dirname, '/public/new_sms.json');
  res.sendFile(DATA_FILE);
});

app.post('/api/sms', function(req, res) {
  console.log(req.body); // TODO remove
  res.json(req.body);
});

// boomi calls this and it will return one messages
// at a time until there are no more messages.
app.get('/api/voiceBoomi', function(req, res) {
  var isFound = false;
  var boomi = {};
  var twillio_voice_cb_url = 'http://techmania.systems/api/twillioVoiceCb?msg_id=';
  Msg.find({ status: 'active' }, function(err, msg) {
    // loop through messages
    msg.forEach(function(msgInstance) {
      // loop through voiceUsers
      msgInstance.voiceUsers.forEach(function(user) {
        if(isFound == false) {
            if(user.status == 'queued') {
              var msgInstanceSnapshot = msgInstance;
              isFound = true;
              user.status = 'sending';
              user.update_dttm = Date.now();
              Msg.findByIdAndUpdate(msgInstanceSnapshot, msgInstance,
                    {new : true}, function(err, msgNew) {
                  if(err) {
                    console.log(err);
                    res.status(500).json(err);
                  } else {
                    // populate response for Boomi
                    boomi = new Boomi({
                      msg_id: msgInstance._id,
                      user_id: user._id,
                      msg: msgInstance.msg,
                      twillio_voice_cb_url: twillio_voice_cb_url+msgInstance._id,
                      to_phone: user.phone
                    });
                    console.log(boomi);
                    res.json(boomi);
                  };
              });
            }
          }
        });
      });
      // response if no queued messages
      if(isFound == false) {
        console.log("no queued messages");
        res.json(boomi);
      }
    });
});

/*
{
  "msg_id": 2,
  "user_id": "12345",
  "sid": "CA02f88f8bae7431e4d50d7bba53dfc68c"
}
*/
// boomi calls this to return the sid after sending to Twillio
app.post('/api/voiceBoomi', function(req, res) {
      var isFound = false;
      Msg.find({ status: 'active' }, function(err, msg) {
        // loop through messages
        msg.forEach(function(msgInstance) {
          if(msgInstance._id == req.body.msg_id) {
          // loop through voiceUsers
            msgInstance.voiceUsers.forEach(function(user) {
              if(isFound == false) {
                if(user._id == req.body.user_id) {
                    var msgInstanceSnapshot = msgInstance;
                    isFound = true;
                    user.sid = req.body.sid;
                    user.update_dttm = Date.now();
                    Msg.findByIdAndUpdate(msgInstanceSnapshot, msgInstance,
                          {new : true}, function(err, msgNew) {
                        if(err) {
                          console.log(err);
                          res.status(500).json(err);
                        } else {
                          console.log(req.body);
                          res.json(req.body);
                        };
                    });
                  }
                }
              });
            }
          });
          // response if no message found
          if(isFound == false) {
            console.log("message not found");
            res.json({});
          }
    });
});


  /*
  /api/voiceBoomiGet?msg_id=5898e76e0d9c640c37a16814&user_id=5898e76e0d9c640c37a16814&sid=CAafae46854e1f347d2a1415b016202d2e
  */
  // boomi calls this to return the sid after sending to Twillio
app.get('/api/voiceBoomiGet', function(req, res) {
    var isFound = false;
    Msg.find({ status: 'active' }, function(err, msg) {
      // loop through messages
      msg.forEach(function(msgInstance) {
        if(msgInstance._id == req.query.msg_id) {
        // loop through voiceUsers
          msgInstance.voiceUsers.forEach(function(user) {
            if(isFound == false) {
              if(user._id == req.query.user_id) {
                  var msgInstanceSnapshot = msgInstance;
                  isFound = true;
                  user.sid = req.query.sid;
                  user.update_dttm = Date.now();
                  Msg.findByIdAndUpdate(msgInstanceSnapshot, msgInstance,
                        {new : true}, function(err, msgNew) {
                      if(err) {
                        console.log(err);
                        res.status(500).json(err);
                      } else {
                        console.log(req.query);
                        res.json(req.query);
                      };
                  });
                }
              }
            });
          }
        });
        // response if no message found
        if(isFound == false) {
          console.log("message not found");
          res.json({});
        }
  });
});

// DO LAST!
app.get('/api/smsBoomi', function(req, res) {
  var DATA_FILE = path.join(__dirname, '/public/new_sms.json');
  res.sendFile(DATA_FILE);
});

// DO LAST!
app.post('/api/smsBoomi', function(req, res) {
  console.log(req.body); // TODO remove
  res.json(req.body);
});

/******************************
 * Twillio
 ******************************/

 /*
 CallStatus: completed
 CallSid: CAf258403ac176507a0419d8ac4d4b7fd3
 */
// Twillio status callback - this will update status
app.post('/api/twillioStatusCb', function(req, res) {
  var isFound = false;
  Msg.find({ status: 'active' }, function(err, msg) {
    // loop through messages
    msg.forEach(function(msgInstance) {
      // loop through voiceUsers
        msgInstance.voiceUsers.forEach(function(user) {
          if(isFound == false) {
            if(user.sid == req.body.CallSid) {
                var msgInstanceSnapshot = msgInstance;
                isFound = true;
                user.status = req.body.CallStatus;
                user.update_dttm = Date.now();
                Msg.findByIdAndUpdate(msgInstanceSnapshot, msgInstance,
                      {new : true}, function(err, msgNew) {
                    if(err) {
                      console.log(err);
                      res.status(500).json(err);
                    } else {
                      console.log(req.body);
                      res.json(req.body);
                    };
                });
              }
            }
          });
      });
      // response if no cb user found
      if(isFound == false) {
        console.log("cb user not found");
        res.json({});
      }
    });
});


// callback for voice TWIML - https://www.twilio.com/docs/api/twiml/say
// sets status
app.post('/api/twillioVoiceCb', function(req, res) {
  var voice_gather_url = '/api/twillioVoiceGather';
  Msg.findById(req.query.msg_id, function(err, msg) {
    if(err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      console.log(msg);
      xw = new XMLWriter;
      xw.startDocument();
      xw.startElement('Response');

      xw.startElement('Gather');
      xw.writeAttribute('action', voice_gather_url);
      xw.writeAttribute('method', 'POST');
      xw.writeAttribute('timeout', '10');
      xw.writeAttribute('finishOnKey', '#');

      xw.startElement('Say');
      xw.writeAttribute('voice', 'alice');
      xw.text(msg.msg);
      xw.endElement();

      //xw.startElement('Pause');
      //xw.endElement();

      xw.startElement('Say');
      xw.writeAttribute('voice', 'alice');
      var gatherMsg = 'Please enter 1 for Yes, any other key for No.  Press the pound key when done.';
      xw.text(gatherMsg);

      xw.endDocument();
      console.log(xw.toString());
      res.set('Content-Type', 'text/xml');
      res.send(xw.toString());
    }
  });
});

/*
CallSid: CAafae46854e1f347d2a1415b016202d2e
Digits: 1
*/
// callback for voice TWML - after gathering digits
// sets response value
app.post('/api/twillioVoiceGather', function(req, res) {
  var isFound = false;
  Msg.find({ status: 'active' }, function(err, msg) {
    // loop through messages
    msg.forEach(function(msgInstance) {
      // loop through voiceUsers
        msgInstance.voiceUsers.forEach(function(user) {
          if(isFound == false) {
            if(user.sid == req.body.CallSid) {
                var msgInstanceSnapshot = msgInstance;
                isFound = true;
                user.response = req.body.Digits;
                user.update_dttm = Date.now();
                Msg.findByIdAndUpdate(msgInstanceSnapshot, msgInstance,
                      {new : true}, function(err, msgNew) {
                    if(err) {
                      console.log(err);
                      //res.status(500).json(err);
                    }
                });
              }
            }
          });
      });
      // response if no cb user found
      if(isFound == false) {
        console.log("cb user not found");
        res.json({});
      }
    });

    // send response
    xw = new XMLWriter;
    xw.startDocument();
    xw.startElement('Response');

    xw.startElement('Say');
    xw.writeAttribute('voice', 'alice');
    xw.text('Thank you, goodbye.');
    xw.endElement();

    xw.endDocument();
    console.log(xw.toString());
    res.set('Content-Type', 'text/xml');
    res.send(xw.toString());

});

/******************************
 * Internal
 ******************************/
 /*function sendCallback(err, result) {

 }*/


// route everything else to index.html
/*app.get('/*', function(req, res) {
  var DATA_FILE = path.join(__dirname, 'index.html');
  res.sendFile(DATA_FILE);
});*/

app.listen(app.get('port'), function() {
  console.log('Server started on port:' + app.get('port'));
});
