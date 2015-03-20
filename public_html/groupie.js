var express = require('express');
var app = express();
var cors = require('cors');
app.use(cors());
var server = require('http').createServer(app);



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
    var startIndex = req.query.start;
    if (!startIndex)
        startIndex = 0;
    if (!city)
        city = "austin";
    var echoNestPath = encodeURI('/api/v4/artist/search?api_key=00ZKZFHPDBMHGHB40&format=json&results=5&start=' + startIndex + '&artist_location=' + city);
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
            var counter = 0;
            async.each(str.response.artists, function (artist, callback) {
                counter++;
                // Perform operation on file here.
                console.log('artist: ' + artist.name);

                var request_data = {
                    url: 'http://api.rdio.com/1/',
                    method: 'POST',
                    data: {
                        query: artist.name,
                        types: "artist",
                        count: 1,
                        method: "search"
                    }
                };

                setTimeout(function () {
                    request({
                        url: request_data.url,
                        method: request_data.method,
                        form: oauth.authorize(request_data, token)
                    }, function (error, response, body) {
                        if (error)
                            callback(error);
                        body = JSON.parse(body);
                        //get tp song of an artist
                        setTimeout(function () {
                            var artist_song = {
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
                                if (error)
                                    callback(error);
                                try {
                                    track = JSON.parse(track);
                                    
                                    if (track.result[0].key !== 't12204728') {
                                        track.result[0].ticketInfo = {"showdate": "", showtime: ""};
                                        geoTrackList.push(track);
                                    }
                                    else
                                        console.log('ignoring t12204728');
                                       
                                    callback();
                                    
                                }
                                catch (err) {
                                    callback(error);
                                }

                            });

                        }, 500);

                    });
                }, 500);



            }, function (err) {
                // if any of the file processing produced an error, err would equal that error
                if (err) {
                    // One of the iterations produced an error.
                    // All processing will now stop.
                    console.log('A file failed to process');
                    return res.status(400).send("Artist processing failed");
                } else {
                    console.log('All artists have been processed successfully');
                    if(city === "West Palm Beach"){
                        geoTrackList[1] = getEdwardSharpeInfo();
                    }
                    return res.status(200).send(geoTrackList);
                }
            });



//            return res.status(200).send(str.response.artists);
        });
    });

    geoArtists.write("");
    geoArtists.end();


});



function getEdwardSharpeInfo() {
    var track = {
        "status": "ok",
        "result": [
            {
                "key": "t3984167",
                "baseIcon": "album/8/0/9/000000000004e908/2/square-200.jpg",
                "canDownloadAlbumOnly": false,
                "radio": {
                    "type": "sr",
                    "key": "sr3984167"
                },
                "artistUrl": "/artist/Edward_Sharpe__The_Magnetic_Zeros/",
                "duration": 303,
                "album": "Edward Sharpe & The Magnetic Zeros",
                "isClean": false,
                "albumUrl": "/artist/Edward_Sharpe__The_Magnetic_Zeros/album/Edward_Sharpe__The_Magnetic_Zeros_2/",
                "shortUrl": "http://rd.io/x/Qit-lGQ/",
                "albumArtist": "Edward Sharpe & The Magnetic Zeros",
                "canStream": true,
                "embedUrl": "https://rd.io/e/Qit-lGQ/",
                "type": "t",
                "gridIcon": "http://rdiodynimages1-a.akamaihd.net/?l=a321800-2%3Aboxblur%2810%25%2C10%25%29%3Ba321800-2%3Aprimary%280.65%29%3B%240%3Aoverlay%28%241%29%3Ba321800-2%3Apad%2850%25%29%3B%242%3Aoverlay%28%243%29",
                "price": null,
                "trackNum": 6,
                "albumArtistKey": "r396228",
                "radioKey": "sr3984167",
                "icon": "http://img02.cdn2-rdio.com/album/8/0/9/000000000004e908/2/square-200.jpg",
                "canSample": true,
                "name": "Home",
                "isExplicit": false,
                "artist": "Edward Sharpe & The Magnetic Zeros",
                "url": "/artist/Edward_Sharpe__The_Magnetic_Zeros/album/Edward_Sharpe__The_Magnetic_Zeros_2/track/Home/",
                "icon400": "http://img00.cdn2-rdio.com/album/8/0/9/000000000004e908/2/square-400.jpg",
                "artistKey": "r396228",
                "canDownload": false,
                "length": 1,
                "canTether": true,
                "albumKey": "a321800",
                "ticketInfo": {"showdate": "May 2nd 2015", showvenue: "Sunfest"}
            }
        ]
    }

    return track;
}


