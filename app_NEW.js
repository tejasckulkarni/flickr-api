const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const { createObjectCsvWriter } = require('csv-writer');
const uuidv1 = require('uuid/v1');

const app = express();
const port = process.env.PORT || 3000;
var records = [];
var dateTaken;

var csvWriter;

var writecsv = () => {
  csvWriter.writeRecords(records).then(() => {
    console.log('CSV File Written');
  });
};

app.set('view engine', 'ejs');
app.use('/assets', express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
  limit: "1000mb",
  extended: true,
  parameterLimit: 50000
}));

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.post('/place', (req, res) => {
  var lat = req.body.lat;
  var lng = req.body.lng;
  var radius = req.body.radius;
  var minDate = req.body.minDate;
  var maxDate = req.body.maxDate;
  let filename = uuidv1();
  csvWriter = createObjectCsvWriter({
    path: `./csv/${filename}}.csv`,
    header: [
      {id: 'lat', title: 'LATITUDE'},
      {id: 'lan', title: 'LONGITUDE'},
      {id: 'datetaken', title: 'DATETAKEN'},
      {id: 'photolink', title: 'LINK'}
    ]
  });
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
      //user_id: flickr.options.user_id,
      authenticated: true,
      lat: lat,
      lon: lng,
      radius: radius,
      min_taken_date: minDate,
      max_taken_date: maxDate,
      //tags: 'River, Water',
      has_geo: !0,
      page: 1000,
      per_page: 5000
    }, function (err, result) {
      if(!result) {
        return;
      }
      res.send(result);
      result.photos.photo.forEach((photo, i) => {
        flickr.photos.getInfo({
          authenticated: true,
          photo_id: photo.id
        },function (err, data) {
          if(data === undefined) {
            return;
          }
          dateTaken = data.photo.dates.taken;
        });
        var itemImgPath = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
        flickr.photos.geo.getLocation({
          authenticated: true,
          photo_id: photo.id
        },function (err, data) {
          if(!data) {
            return;
          }
          records.push({lat: data.photo.location.latitude,  lan: data.photo.location.longitude, datetaken: dateTaken, photolink: itemImgPath});
          if (i === result.photos.photo.length - 1) {
            writecsv(records);
          }
        });
      });
    });
  });
});

app.post('/location', (req, res) => {
  var photo_id = req.body.photoId;
  const Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: "d74a83dbca2debc1168acf0e9094aa32",
      secret: "90a36510575ccd0a",
      user_id: "162499684@N07",
      access_token: "72157670068035258-225970c98e4237f4",
      access_token_secret: "ace8b1873ff5081f"
    };

    Flickr.authenticate(flickrOptions, function (error, flickr) {
    flickr.photos.geo.getLocation({
      authenticated: true,
      photo_id: photo_id
    },function (err, data) {
      if(!data) {
        return;
      }
      res.send(data);
    });
  });
});

app.listen(port, () => {
  console.log(`Flickr App running at localhost:${port}`);
});
