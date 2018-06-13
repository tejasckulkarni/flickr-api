const express = require('express');
const bodyParser = require('body-parser');


const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use('/assets', express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit: 50000
}));



app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.post('/place', (req, res) => {
  var lat = req.body.lat;
  var lng = req.body.lng;
  const Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: "d74a83dbca2debc1168acf0e9094aa32",
      secret: "90a36510575ccd0a",
      user_id: "162499684@N07",
      access_token: "72157670068035258-225970c98e4237f4",
      access_token_secret: "ace8b1873ff5081f"
    };

  Flickr.authenticate(flickrOptions, function (error, flickr) {
    flickr.photos.search({
      user_id: flickr.options.user_id,
      authenticated: true,
      page: 1,
      per_page: 500
    }, function (err, result) {
      res.send(result);
    });
    /* flickr.photos.geo.photosForLocation({
      user_id: flickr.options.user_id,
      authenticated: true,
      lat: lat,
      lon: lng,
      page: 1,
      per_page: 500
    }, function(err, result) {
      res.send(result);
      console.log(lat, lng);
    }); */
  });
});


app.listen(port, () => {
  console.log('Flickr App running at localhost:', port);
});
