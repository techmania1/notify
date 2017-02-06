var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('./node/user');
var app = express();

app.set('port', (process.env.PORT || 3000));
mongoose.connect('mongodb://localhost/notifydb');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');

    // Application/json
    res.contentType('application/json');
    next();
});

// https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications

// drop all
app.post('/api/dropAll', function(req, res) {
console.log("dropping all data!"); // TODO remove
  User.collection.drop();
  res.end();
});

// get all users
app.get('/api/users', function(req, res) {
  User.find({}, function(err, result) {
    if (err) throw err;
    res.json(result);
  });
});

// get user by id
app.get('/api/userById/:id', function(req, res) {
  var id = req.params.id
  User.findById( req.params.id, function(err, result) {
    if (err) throw err;
    res.json(result);
  });
});

// save user
app.post('/api/user', function(req, res) {
  var user = new User({
    name: req.body.name,
    phone: req.body.phone
  });
  user.save(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });
});

app.post('/api/send', function(req, res) {
  console.log("post send"); // TODO remove
  res.json({ success: true });
});

app.get('/api/voice', function(req, res) {
  var DATA_FILE = path.join(__dirname, '/public/new_voice.json');
  res.sendFile(DATA_FILE);
});

app.get('/api/sms', function(req, res) {
  var DATA_FILE = path.join(__dirname, '/public/new_sms.json');
  res.sendFile(DATA_FILE);
});

// Twillio status callback
app.post('/api/twillioCb', function(req, res) {
  console.log("post twillio callback"); // TODO remove
  res.json({ success: true });
});


// route everything else to index.html
app.get('/*', function(req, res) {
  var DATA_FILE = path.join(__dirname, 'index.html');
  res.sendFile(DATA_FILE);
});

app.listen(app.get('port'), function() {
  console.log('Server started on port:' + app.get('port'));
});
