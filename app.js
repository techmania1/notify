var express    = require('express');
var app        = express();
//var router = express.Router();
var bodyParser = require('body-parser');
var path    = require("path");
//var concat = require('concat-stream');
//var http = require('http');
//var https = require('https');
var port = process.env.PORT || 3000;

/**
 * Global functions
 */

/*var modHeader = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'api_key, Content-Type, Authorization, Content-Length, X-Requested-With');
    next(); // make sure we go to the next routes and don't stop here!
};

var apiKey = function(req, res, next) {
	var headerKey = req.get('api_key');
	var queryKey = req.query.api_key;
	var preferredKey;
	if(queryKey==undefined) {
		if(headerKey==undefined) {
			res.status(401).json({ "code": 401, "summary": "unauthorized", "details": [] })
		} else {
			preferredKey = headerKey;
			console.log("preferredKey:"+preferredKey);
			next();
		}
	} else {
		preferredKey = queryKey;
		console.log("preferredKey:"+preferredKey);
		next();
	}
	if(preferredKey) {
		// is key valid
		var valid = true;
		if (valid) {
			next();
		} else {

		}
	}
};*/

var logger = function(req, res, next) {
    console.log("time:"+Date.now()+", url:"+req.originalUrl);
    next(); // make sure we go to the next routes and don't stop here!
};


/**
 * App logic functions
 */

/*function getQrJson(callback) {
   var options = {
   //headers: {'Cookie': 'myCookie=myvalue'},
     host: 'xxxx.com',
     port: '80',
     method: 'GET',
     path: '/'
   };
    return http.get(options, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            callback(body);
        });
        req.on('error', function(e) {
          // TODO callback(e);
        });
    });

}*/

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve static
app.use('/public', express.static('public'));

// middleware to modify header
//app.use(modHeader);

// middleware to check authentication
//app.use(apiKey);

// middleware to disable cache
app.disable('etag');

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/public/index.html'));
})

app.get('/getQrJson', function (req, res) {
  getQrJson(function(data){
    console.log(data);
    res.json(data);
  })
})

app.get('/haHaJson', function (req, res) {
  res.json({'test': 'output'});
})

// ROUTES FOR OUR API
// =============================================================================
//var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
/*router.use(logger);

router.get('/', function (req, res) {
  res.send('Home')
})

router.get('/about', function (req, res) {
  res.send('About')
})*/

/*router.get('/', function(req, res) {
    res.json({ message: 'api' });
    //res.sendFile('index.html');
});*/

//app.use('/', express.static('public', 'index.html'));

// more routes for our API will happen here
/*router.route('/getProgram/siteDetail')

    // create a bear (accessed at POST http://localhost:8080/api/bears)
    .get(function(req, res) {

        var bear = new Bear();      // create a new instance of the Bear model
        bear.name = req.body.name;  // set the bears name (comes from the request)

        // save the bear and check for errors
        bear.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Bear created!' });
        });
        res.json({ message: { payload: "/v1/getProgram/siteDetail"} });
    });*/

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed
//app.use('/v1', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
