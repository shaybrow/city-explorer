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
  console.log(info);

  searchedLoc = request.query.city;
  // 

  const newPlace = new Place(info);

  response.send(newPlace);

});




// ======= Functions ======

function Place(objectFromJson) {
  this.search_query = searchedLoc;
  this.formatted_query = objectFromJson.display_name;
  this.longitude = objectFromJson.lon;
  this.latitude = objectFromJson.lat;

}
// function Food(objectFromJson) {

//   this.restaurant = objectFromJson.restaurant.name;
//   this.locality = objectFromJson.location.locality_verbose;
//   this.cuisines = objectFromJson.cuisines;

// }


//run that server
app.listen(PORT, () => console.log(`we running on ${PORT}`));
