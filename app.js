var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 3000));
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
    next();
});

app.get('/', function(req, res) {
  var DATA_FILE = path.join(__dirname, 'index.html');
  res.sendFile(DATA_FILE);
});

app.get('/api/getUsers', function(req, res) {
  var DATA_FILE = path.join(__dirname, '/public/users.json');
  res.sendFile(DATA_FILE);
});

app.listen(app.get('port'), function() {
  console.log('Server started on port' + app.get('port'));
});
