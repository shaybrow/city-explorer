'use strict';

const express = require('express');

const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3333;

let searchedLoc;

app.get('/location', (request, response) => {
  if (request.query.city === '') {
    response.status(500).send('We do not have info for Nothing, Nowhere');
    return;
  }
  // normalizing data
  const jsonInfo = require('./data/location.json');
  const info = jsonInfo[0];

  searchedLoc = request.query.city;
  // this works and I love it

  const newPlace = new Place(info);

  response.send(newPlace);

});
app.get('/weather', (request, response) => {
  const get = [
    {
      'forecast': 'Partly cloudy until afternoon.',
      'time': 'Mon Jan 01 2001'
    },
    {
      'forecast': 'Mostly cloudy in the morning.',
      'time': 'Tue Jan 02 2001'
    },
  ];
  const theWeather = [];
  get.forEach((object) => {
    theWeather.push(new Weather(object));
  });
  response.send(theWeather);
});



// ======= Functions ======

function Place(objectFromJson) {
  this.search_query = searchedLoc;
  this.formatted_query = objectFromJson.display_name;
  this.longitude = objectFromJson.lon;
  this.latitude = objectFromJson.lat;

}
function Weather(objectFromJson) {
  this.forecast = objectFromJson.forecast;
  this.time = objectFromJson.time;
}

// function Food(objectFromJson) {

//   this.restaurant = objectFromJson.restaurant.name;
//   this.locality = objectFromJson.location.locality_verbose;
//   this.cuisines = objectFromJson.cuisines;

// }


//run that server
app.listen(PORT, () => console.log(`we running on ${PORT}`));
