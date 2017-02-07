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
   });
 });

 // send msg
app.post('/api/send', function(req, res) {
  // pre-populate voiceUsers and smsUsers arrays
  var arrVoiceUsers = [];
  var arrSmsUsers = [];
  for(var i = 0; i < req.body.users.length; i++) {
    var data = {
      status: 'boomi-queued',
      update_dttm: Date.now(),
      _id: req.body.users[i]._id,
      name: req.body.users[i].name,
      phone: req.body.users[i].phone,
      sms_enabled: req.body.users[i].phone
    };
    arrVoiceUsers.push(data);
    if(req.body.users[i].sms_enabled==true){
      arrSmsUsers.push(data);
    }
  }

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

// boomi
app.get('/api/voiceBoomi', function(req, res) {
  // find active messages
  var isFound = false;
  var boomi = {};
  Msg.find({ status: 'active' }, function(err, msg) {
    if(err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      // loop through messages
      msg.forEach(function(message) {
        //if (isFound==false) {

          console.log(message.msg);
          // loop through voiceUsers and find
          // those with 'boomi-queued' status
          message.voiceUsers.forEach(function(voiceUsers) {
            // update and return the first user
            /*Msg.findByIdAndUpdate(req.params.id, req.body,
                  {new : true}, function(err, user) {
                if(err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {
                  console.log(user);
                  res.json(user);
                };
            });*/
            if (isFound==false) {
              if(voiceUsers.name == 'Ricky Lewin') { // TODO remove!!!
              //if(voiceUsers.status == 'boomi-queued') {
                isFound = true;
                var twillio_voice_cb_url = 'http://techmania.systems/api/twillioVoiceCb?msg_id=';
                boomi = new Boomi({
                  msg_id: message._id,
                  user_id: voiceUsers._id,
                  msg: message.msg,
                  twillio_voice_cb_url: twillio_voice_cb_url+message._id,
                  to_phone: voiceUsers.phone
                });


                // TODO need to save this - somehow!!!!!
                console.log("Match found user ->" + voiceUsers.name + ", updating.."); // TODO remove

                /*
                var msgOld = msg;
                voiceUsers.status = 'boomi-sending';
                Msg.findOneAndUpdate(msgOld, msg, function(err, msgNew) {
                  if (err) throw err;
                  console.log("new...");
                  console.log(msgNew);
                  //res.send(msgNew);
                });*/

                //console.log(msg);
                //res.send(msg);

                /*Msg.save(function(err, msg) {
                  if (err) throw err;
                  console.log('Msg successfully updated!');
                  console.log(msg);
                  res.send(msg);
                });*/
              }
            }

          });


        //}
      });

      console.log(boomi);
      res.send(boomi);
    }
  });

});

app.post('/api/voiceBoomi', function(req, res) {
  console.log(req.body); // TODO remove
  res.json(req.body);
});

app.get('/api/smsBoomi', function(req, res) {
  var DATA_FILE = path.join(__dirname, '/public/new_sms.json');
  res.sendFile(DATA_FILE);
});

app.post('/api/smsBoomi', function(req, res) {
  console.log(req.body); // TODO remove
  res.json(req.body);
});

/******************************
 * Twillio
 ******************************/

// Twillio status callback - this will update status
/*
sms
-MessageSid
-MessageStatus
*/
app.post('/api/twillioStatusCb', function(req, res) {
  console.log(req.body); // TODO remove
  res.json(req.body);
  /*var _id = req.body._id;
  var twillio_id = req.body.twillio_id;
  var status = req.body.status;
  Msg.findById(_id, function(err, user) {
    if(err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      // TODO determine if this is sms or voice based on data from Twillio

      for(var i = 0; i < user.voiceUsers.length; i++) {
        if(user.voiceUsers[i]._id==twillio_id) {
          console.log("found voice user->"+ user.voiceUsers[i].name); // TODO remove
          user.voiceUsers[i].status = status;
          user.voiceUsers[i].update_dttm = Date.now();
        }
      }

      for(var i = 0; i < user.smsUsers.length; i++) {
        if(user.smsUsers[i]._id==twillio_id) {
          console.log("found sms user->"+ user.smsUsers[i].name); // TODO remove
          user.smsUsers[i].status = status;
          user.smsUsers[i].update_dttm = Date.now();
        }
      }
      // save
      user.save();
      res.json(user);
    }
  });*/
});


// callback for voice TWML - https://www.twilio.com/docs/api/twiml/say
app.post('/api/twillioVoiceCb', function(req, res) {
  Msg.findById(req.query.msg_id, function(err, msg) {
    if(err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      console.log(msg);
      xw = new XMLWriter;
      xw.startDocument();
      xw.startElement('Response');
      xw.startElement('Say');
      xw.writeAttribute('voice', 'alice');
      xw.text(msg.msg);
      xw.endDocument();
      console.log(xw.toString());
      res.set('Content-Type', 'text/xml');
      res.send(xw.toString());
    }
  });

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
