'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

require('dotenv').config();

const app = express();
app.use(cors());

const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', (error) => console.log(error));

const PORT = process.env.PORT || 3333;

app.get('/location', (request, response) => {
  if (request.query.city === '') {
    response.status(500).send('We do not have info for Nothing, Nowhere');
    return;
  }

  const key = process.env.LOCATION_API_KEY;
  const searchedLoc = request.query.city;
  const sqlCheck = 'SELECT * FROM place WHERE search_query=$1';
  const sqlArr = [searchedLoc];


  client.query(sqlCheck, sqlArr)
    .then(result => {
      if (result.rows.length !== 0) {
        response.send(result.rows[0]);

      } else {


        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedLoc}&format=json`;
        superagent.get(url)
          .then(retrieved => {
            // console.log(retrieved.body[0]);
            // normalizing data
            const newPlace = new Place(retrieved.body[0], searchedLoc);
            // response.send(retrieved.body[0]);
            const sqlCheck = 'INSERT INTO place (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';
            const sqlArr = [newPlace.search_query, newPlace.formatted_query, newPlace.latitude, newPlace.longitude];
            response.send(newPlace);
            client.query(sqlCheck, sqlArr);
          })

          .catch(error => {
            response.status(500).send('ooof');
            console.log(error.message);
          });





      }
    });
});
app.get('/movies', (req, res) => {
  const searchedLoc = req.query.search_query;
  const key = process.env.MOVIE_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&&query=${searchedLoc}&page=1&include_adult=false`;
  console.log(url);


  superagent.get(url)
    .then(result => {
      const moviesArr = [];
      // console.log(result.body.results);
      const returnedMovies = result.body.results;
      returnedMovies.map((obj) => {
        moviesArr.push(new Movie(obj));
      });
      res.send(moviesArr);
    })
    .catch(error => {
      res.status(500).send('movies failed');
      console.log(error.message);
    });
});
app.get('/yelp', (req, res) => {
  const lat = req.query.latitude;
  const lon = req.query.longitude;
  const key = process.env.YELP_API_KEY;
  const page = req.query.page;
  const offset = 3 * (page - 1);

  const url = `https://api.yelp.com/v3/autocomplete?text=del&${lon}&${lon}&start=${offset}`;

  superagent.get(url
    .set('user-key', key))
    .then(result => {
      console.log(result);
      const yelpArray = [];
      const returnedYelp = result.body.data;

      yelpArray.map((object) => {

        returnedYelp.push(new Yelp(object));
      });
      res.send(yelpArray);
    })
    .catch(error => {
      res.status(500).send('yelp failed');
      console.log(error.message);
    });
});

app.get('/weather', (request, response) => {
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const key = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${key}&days=8&lat=${lat}&lon=${lon}`;

  superagent.get(url)
    .then(retrieved => {
      const theWeather = [];
      const returnedWeather = retrieved.body.data;

      returnedWeather.map((object) => {

        theWeather.push(new Weather(object));
      });
      response.send(theWeather);

    })
    .catch(error => {
      response.status(500).send('weather failed');
      console.log(error.message);
    });
});
app.get('/parks', (request, response) => {
  const city = request.query.formatted_query;
  const key = process.env.PARKS_API_KEY;
  const url = `https://developer.nps.gov/api/v1/parks?q=${city}&limit=5&api_key=${key}`;

  superagent.get(url)
    .then(retrieved => {
      // console.log(retrieved.body.data);
      const returnedPark = retrieved.body.data;

      const thePark = returnedPark.map((object) => {

        return new Park(object);
      });
      response.send(thePark);

    })
    .catch(error => {
      response.status(500).send('parks failed');
      console.log(error.message);
    });
});


// ======= Functions ======

function Place(objectFromJson, searchq) {
  this.search_query = searchq;
  this.formatted_query = objectFromJson.display_name;
  this.longitude = objectFromJson.lon;
  this.latitude = objectFromJson.lat;

}
function Weather(objectFromJson) {
  this.forecast = objectFromJson.weather.description;
  this.time = objectFromJson.datetime;
}
function Park(object) {
  this.name = object.fullName;
  this.address = object.addresses[0].line1;
  this.fee = object.entranceFees[0].cost;
  this.description = object.description;

}

function Movie(obj) {
  this.title = obj.original_title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_count;
  this.image_url = obj.poster_path;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}

function Yelp(obj) {
  this.title = obj.original_title;
  this.overview = obj.overview;
  this.image_url = obj.poster_path;
  this.popularity = obj.popularity;

}

// function Food(objectFromJson) {

//   this.restaurant = objectFromJson.restaurant.name;
//   this.locality = objectFromJson.location.locality_verbose;
//   this.cuisines = objectFromJson.cuisines;

// }


//run that server
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`we running on ${PORT}`));
  });

// // something 
// const page = req.query.page
