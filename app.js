var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  ,	Twit = require('twit')
  , io = require('socket.io').listen(server);

// server.listen(8080);
server.listen(process.env.PORT || 5000)

// routing
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var T = new Twit({
    consumer_key:         'cmr5Kcr2KaLgz1IntDSDQ'
  , consumer_secret:      '1aNgD7Xn7NClsQuYLL2S8g5z113e6IPVpcPUcvFBiRw'
  , access_token:         '1029729847-B1Dzt6ztu0LmEHhoYzvMTqnyAzRdabP7hru6Cfr'
  , access_token_secret:  'FZrrvgI3RJYlA8CWQIvGBAWrjf9XQug3tNJaHHsoe4'
});

io.sockets.on('connection', function (socket) {
	console.log('Connected');


	var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]
	var world = ['-180','-90','180','90']
	var us = ['-120','30','-70','50']
	var mit = ['-71.10781','42.35360', '-71.07837', '42.36400']
	var stream = T.stream('statuses/filter', { locations: world })

	// var watchList = ['love', 'hate'];
	// var stream = T.stream('statuses/filter', { track: watchList })

	stream.on('tweet', function (tweet) {
		if (tweet.coordinates != null){
			// io.sockets.emit('stream',tweet.text);
			io.sockets.emit('stream',tweet.coordinates.coordinates);
		}
  });

 });

