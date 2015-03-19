var express = require('express');
var app = express();
var server = require('http').createServer(app);

var http = require('http');
var LastFmNode = require('lastfm').LastFmNode;

var geocoder = require('geocoder');
geocoder.reverseGeocode( 33.7489, -84.3789, function ( err, data ) {
  console.log(data);
});

var lastfm = new LastFmNode({
    api_key: '7bf99143ef8da6a02a70aec40475e258', // sign-up for a key at http://www.last.fm/api
    secret: '68fe86acc21a210367f429e2b69bc0d2'
});

server.listen(3000);
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.static(__dirname + '/public/app'));
app.use(app.router);


app.get('/', function (req, res) {
    res.send("hello");
});

app.get('/artists', function (req, res) {

    var city = req.query.param;
    if (!city)
        city = "austin";

    var options = {
        host: 'developer.echonest.com',
        path: '/api/v4/artist/search?api_key=00ZKZFHPDBMHGHB40&format=json&results=10&artist_location=austin',
        method: 'GET'
    };
    var url = "http://developer.echonest.com/api/v4/artist/search?api_key=00ZKZFHPDBMHGHB40&format=json&results=10&artist_location=austin";
    var geoArtists = http.request (options ,function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            str=JSON.parse(str);
//            var artists = str.toptracks;
//            var returnObject = [];
//            console.log(artists.track.length);
//            for(var i = 0 ; i < artists.track.length ; i++){
//                returnObject.push(artists.track[i].artist);
//            }
            return res.status(200).send(str.response.artists);
        });
    });

    geoArtists.write("");
    geoArtists.end();


});