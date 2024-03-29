function initialize() {

	var socket = io.connect(); 
	var counter = 0;
	var iterations = $("#tweetnumber").val();
	var markers = $("#markernumber").val();
	window.marker = [];
	window.tweets = [];
	window.words = []; 
	var wordCounter = 0;
	var displayWords = $("#wordnumber").val();
	

	$("#submitbutton").click(function() {
		for(var i = 0; i < window.marker.length; i++){
			window.marker[i].setMap(null);
		}
		for(var i = 0; i < window.words.length; i++){
			window.words[i].set('map', null);
		}
		markers = $("#markernumber").val();
		iterations = $("#tweetnumber").val();
		displayWords = $("#wordnumber").val();
	});

	///................... Initalize Map ...................///

	var styles = [
		{featureType: 'landscape',elementType: 'all',stylers: [{ hue: '#1188aa' },{ saturation: 75 },{ lightness: -59 },{ visibility: 'simplified' }]
		},{featureType: 'water',elementType: 'all',stylers: [{ hue: '#222222' },{ saturation: -100 },{ lightness: -82 },{ visibility: 'on' }]
		},{featureType: 'road',elementType: 'all',stylers: [{ hue: '#000000' },{ saturation: -100 },{ lightness: -100 },{ visibility: 'off' }]
		},{featureType: 'poi',elementType: 'all',stylers: [{ hue: '#000000' },{ saturation: -100 },{ lightness: -100 },{ visibility: 'off' }]
		},{featureType: 'transit',elementType: 'all',stylers: [{ hue: '#000000' },{ saturation: 0 },{ lightness: -100 },{ visibility: 'off' }]
		},{featureType: 'administrative',elementType: 'geometry',stylers: [{ hue: '#000000' },{ saturation: 0 },{ lightness: -100 },{ visibility: 'off' }]
		},{featureType: 'administrative',elementType: 'all',stylers: [{ hue: '#000000' },{ saturation: 0 },{ lightness: 0 },{ visibility: 'off' }]}

	];

	var mapOptions = {
		mapTypeControlOptions: {
			mapTypeIds: [ 'Styled']
		},
		center: new google.maps.LatLng(30,0),
		zoom: 2,
		mapTypeId: 'Styled'
	};

	var mapDiv = document.getElementById('map');

	window.map = new google.maps.Map(mapDiv, mapOptions);
	var styledMapType = new google.maps.StyledMapType(styles, { name: 'Styled' });
	window.map.mapTypes.set('Styled', styledMapType);

	new DayNightOverlay({
	    map: map,
	    fillColor: 'rgba(0,0,0,0.2)'
	});

	var myLatlng = new google.maps.LatLng(37,0);
	if (window.mapLabel) {
		mapLabel.set('text', modeWord);
		mapLabel.set('position', myLatlng);
	} else {
		window.mapLabel = new MapLabel({text: "Initializing...",position: myLatlng,map: map,fontSize: 40, fontFamily: "Helvetica", strokeWeight:4,strokeColor:'333333',fontColor:'ffffff',align: 'center'});
		window.mapLabel.set('position', myLatlng);
	}


	///////////////////////////////////////////////////////////


	///.................. Initalize Socket ..................///
	///if (typeof(x) != "undefined")
	socket.on('stream', function(tweet){

		window.tweets[counter%iterations] = tweet;
		// console.log(tweet.text);

		var wordArray = [];

		for(var i = 0; i < window.tweets.length; i++){
			var words = window.tweets[i].text;
			wordArray = wordArray.concat( words );
        }
		// window.modeWord = mode(wordArray);
		// console.log(window.modeWord);
		var averageCoordinate = averageCoordinates(window.tweets);


		if (mode(wordArray) != window.modeWord){
			window.mapLabel.setMap(null);
			if (displayWords != 0) {
				window.modeWord = mode(wordArray);

				var x = window.tweets[counter%iterations].coordinates[0]
				var y = window.tweets[counter%iterations].coordinates[1]
				myLatlng = new google.maps.LatLng(y,x);

				if (window.words[wordCounter%displayWords]) {
				//if marker already was created change positon
					window.words[wordCounter%displayWords].set('text', window.modeWord);
					window.words[wordCounter%displayWords].set('position', myLatlng);
					window.words[wordCounter%displayWords].set('fontSize', 40);
					window.words[wordCounter%displayWords].set('map', map);
					shrinkText( window.words[wordCounter%displayWords] );

				} else {
					window.words[wordCounter%displayWords] = new MapLabel({
						text: window.modeWord,
						position: myLatlng,
						map: map,
						fontSize: 40,
						fontFamily: "Helvetica",
						strokeWeight:0,
						fontColor:'ffffff',
						align: 'center'
					});
					window.words[wordCounter%displayWords].set('position', myLatlng);
					window.words[wordCounter%displayWords].set('map', map);
					shrinkText( window.words[wordCounter%displayWords] );
				}
			}
			

			// for(var i = 0; i < window.words.length; i++){
				// window.words[(wordCounter-i)%displayWords].set('fontSize', (displayWords - i)*2);
				// console.log(window.words[(wordCounter-i)%displayWords].fontSize);
			// }

			wordCounter += 1;
		}
		
		// makeNewLabel(averageCoordinate.x, averageCoordinate.y, "test", 20)
		// console.log(averageCoordinates(window.tweets))
		// console.log(wordArray);
         


	///.................. Initalize Markers ..................///
		if (markers > 0){
			myLatlng = new google.maps.LatLng(tweet.coordinates[1],tweet.coordinates[0]);

			if (window.marker[counter%markers]) {
			//if marker already was created change positon
				window.marker[counter%markers].setPosition(myLatlng);
				window.marker[counter%markers].setMap(map);
			} else {
				//create a marker
				window.marker[counter%markers] = new google.maps.Marker({
					position: myLatlng
				});

				window.marker[counter%markers].setMap(map);
			}

		}
	

		counter += 1;
	});

	///................ Initalize Mode Function ................///

	function mode(array){
		if(array.length == 0)
			return null;
		var modeMap = {};
		var maxEl = array[0], maxCount = 1;
		for(var i = 0; i < array.length; i++){
			var el = array[i];
			if(modeMap[el] == null) modeMap[el] = 1;
			else
				modeMap[el]++;  
			if(modeMap[el] > maxCount){
				maxEl = el;
				maxCount = modeMap[el];
			}
		}
		return maxEl;
	}


	///................ Return Average Coordinate ................///

	function averageCoordinates(object){
		var x = 0;
		var y = 0;
		for(var i = 0; i < object.length; i++){
			x += object[i].coordinates[0];
			y += object[i].coordinates[1];
		}
		// console.log(x / object.length, y / object.length);
		x = x / object.length;
		y = y / object.length
		return {"x": x, "y": y}
	}

	function makeNewLabel(x, y, word, size){
		var myLatlng = new google.maps.LatLng(y,x);
		var newLabel = new MapLabel({
			text: word,
			position: myLatlng,
			map: map,
			fontSize: size,
			fontFamily: "Helvetica",
			strokeWeight:0,
			fontColor:'ffffff',
			align: 'center'
		});

		newLabel.set('position', myLatlng);
		
	}

	function shrinkText(object){
		// window.words[wordCounter%displayWords]
		
		object.set('fontSize', object.fontSize - 1);
		if (object.fontSize > 0) {
			setTimeout(function(){ 
			    shrinkText(object);
			    // console.log("shrinking");
			}, 30);
		}
	} 

};
