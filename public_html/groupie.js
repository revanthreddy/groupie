var express = require('express');
var app = express();
var cors = require('cors');
app.use(cors());
var server = require('http').createServer(app);
var Firebase = require('firebase');
var myRootRef = new Firebase('https://groopy.firebaseio.com');
myRootRef.set("hello world!");

var http = require('http');
var config = {rdio_api_key: 'fzcukawmjkemz8bvqf522m37', rdio_api_shared: '9hkN7FEJPn'};
var rdio = require('rdio')(config);
var OAuth = require('oauth-1.0a');
var request = require('request');
var async = require('async');

var oauth = OAuth({
    consumer: {
        public: 'fzcukawmjkemz8bvqf522m37',
        secret: '9hkN7FEJPn'
    },
    signature_method: 'HMAC-SHA1'
});

var token = {
    public: 'esgj5rtwcx7f43he6j6r34grf5ztgd5ka8nw39rbvaxtzcyyytsk83ne8fwp8yju',
    secret: 't6wrSXqTtZS5'
};

//var request_data = {
//    url: 'http://api.rdio.com/1/',
//    method: 'POST',
//    data: {
//        artist: "r139688",
//        extras: "iframeUrl",
//        count: 1,
//        method: "getTracksForArtist"
//    }
//};
//request({
//    url: request_data.url,
//    method: request_data.method,
//    form: oauth.authorize(request_data, token)
//}, function (error, response, body) {
//    console.log(body);
//});


//var geocoder = require('geocoder');
//geocoder.reverseGeocode( 33.7489, -84.3789, function ( err, data ) {
//  console.log(data);
//});
//rdio.api('fzcukawmjkemz8bvqf522m37', '9hkN7FEJPn', {
//                method: 'search',
//                query : 'spoon',
//                type: 'artist',
//                count: 1
//            }, function(err, data){
//                console.log(data);
//            });


server.listen(3000);
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.static(__dirname + '/public/app'));
app.use(app.router);


app.get('/', function (req, res) {
    res.send("hello");
});

app.get('/artists/:city/playlist', function (req, res) {

    var city = req.param('city');
    
    if (!city)
        city = "austin";
    var echoNestPath = encodeURI('/api/v4/artist/search?api_key=00ZKZFHPDBMHGHB40&format=json&results=5&artist_location='+city);
    var options = {
        host: 'developer.echonest.com',
        path: echoNestPath,
        method: 'GET'
    };
    
    var geoArtists = http.request(options, function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            str = JSON.parse(str);
            var geoTrackList = [];
            async.each(str.response.artists, function (artist, callback) {

                // Perform operation on file here.
                console.log('artist: ' + artist.name);
                
                
                
                
                var request_data = {
                    url: 'http://api.rdio.com/1/',
                    method: 'POST',
                    data: {
                        query: artist.name,
                        types: "artist",
                        count:1,
                        method:"search"
                    }
                };
                
                setTimeout(function(){
                request({
                    url: request_data.url,
                    method: request_data.method,
                    form: oauth.authorize(request_data, token)
                }, function (error, response, body) {  
                    if(error)
                        callback(error);
                        body = JSON.parse(body);    
                        //get tp song of an artist
                        setTimeout(function(){
                                var artist_song= {
                                url: 'http://api.rdio.com/1/',
                                method: 'POST',
                                data: {
                                    artist: body.result.results[0].key,
                                    extras: "iframeUrl",
                                    count: 1,
                                    method: "getTracksForArtist"
                                    }
                                };
                                request({
                                    url: artist_song.url,
                                    method: artist_song.method,
                                    form: oauth.authorize(artist_song, token)
                                }, function (error, response, track) {
                                    if(error)
                                        callback(error);
                                   try {
                                        geoTrackList.push(JSON.parse(track));
                                    callback();
                                    }
                                    catch(err) {
                                        callback(error);
                                    }
                                    
                                });
                    
                        } , 500);
                    
                });
            } , 500);
                
                
                
                
                

            }, function (err) {
                // if any of the file processing produced an error, err would equal that error
                if (err) {
                    // One of the iterations produced an error.
                    // All processing will now stop.
                    console.log('A file failed to process');
                    return res.status(400).send("Artist processing failed");
                } else {
                    console.log('All artists have been processed successfully');
                    return res.status(200).send(geoTrackList);
                }
            });



//            return res.status(200).send(str.response.artists);
        });
    });

    geoArtists.write("");
    geoArtists.end();


});