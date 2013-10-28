var express = require('express')
	, app = express()
	, http = require('http')
	, server = http.createServer(app)
	, XRegExp = require('xregexp').XRegExp
	, Twit = require('twit')
	, io = require('socket.io').listen(server);
	// require('socket.io').listen(app, { log: false });

server.listen(process.env.PORT || 5000);




process.env.PWD = process.cwd();
app.use(express.static(process.env.PWD + '/public'));

// routing
app.get('/', function (req, res) {
	res.sendfile(process.env.PWD + '/public/index.html');
});

// app.use(express.static(__dirname + '/public')); //DOESN'T work with Heroku


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
			var tweetText = cleanString(tweet.text);
			tweetText = cleanWords(tweetText);
			// console.log(tweetText);
			io.sockets.emit('stream',{"coordinates":tweet.coordinates.coordinates,"text":tweetText});
		}
	});

 });

///............... Strip Bad Characters ...............///

function cleanString(string){
	var returnArray = [];
	// var regex = XRegExp("[^\\s\\p{Latin}]+", "g");
	var regex = XRegExp("[^\\#\\:\\//\\.\\s\\p{N}\\p{L}-]+", "g");
	var string = XRegExp.replace(string, regex, "").toLowerCase().split( /[\s\n\r]+/g );

	for(var i = 0; i < string.length; i++){ 
		if (string[i].length > 2) returnArray.push(string[i]);
	}
	return returnArray;
}

///................ Remove Common Words ................///

var commonWords = ["the","of","and","a","to","in","is","you","that","it","he","was","for","on","are","as","with","his","they","i","at","be","this","have","from","or","one","had","by","word","but","not","what","all","were","we","when","your","can","said","there","use","an","each","which","she","do","how","their","if","will","up","other","about","out","many","then","them","these","so","some","her","would","make","like","him","into","time","has","look","two","more","write","go","see","number","no","way","could","my","than","first","been","call","who","oil","its","now","find","long","down","day","did","get","come","made","may","part","im","me", "que","de","no","a","la","el","es","y","en","lo","un","por","qué","me","una","te","los","se","con","para","mi","está","si","bien","pero","yo","eso","las","sí","su","tu","aquí","del","al","como","le","más","esto","ya","todo","esta","vamos","muy","rt","ka", "pic", "aku", "just", "others", "les", "apa"];

function cleanWords(array){
	for(var i = 0; i < commonWords.length; i++){ 
		array = array.clean(commonWords[i]);
	}
	return array;
}

///................ Remove Value From Array ................///

Array.prototype.clean = function(deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {         
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};

