const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const getEvents = require('../lib/eventbrite.js');
const Promise = require('bluebird');

const PORT = process.env.PORT || 3000;
const moment = require('moment');
const {
  APIKEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = require('../config.js');

const app = express();

// ======================================================================
//                    Passport Initialization
// ======================================================================

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://127.0.0.1:3000/auth/google/callback',
  passReqToCallBack: true,
}, (accessToken, refreshToken, userProfile, callback) => {
  Promise.resolve(console.log('user profile:', userProfile))
    .then((error, userProfile) => callback(null, userProfile));
}));

passport.serializeUser((user, done) => {
  console.log('User: ', user.displayName); // If there is a persistent session, the console logs out the displayName
  done(null, user.id);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(express.static(path.join(__dirname, '/../client/dist')));
app.use(bodyParser.json());
app.use(session({ secret: 'chadam' }));

app.use(passport.initialize());
app.use(passport.session());


// ======================================================================
//                    User login to Google
// ======================================================================

// app.get(
//   '/auth/google',
  // (req, res, next) => {
  //   console.log('login endpoint is working!');
  //   next();
  // },
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );

app.get('/auth/google',
  (req, res, next) => {
    console.log('login endpoint is working!');
    next();
  },
  passport.authenticate('google', { scope:
    [ 'profile',
      'email' ] }
));


app.get(
  '/auth/google/callback',
  (req, res, next) => {
    console.log(req.user);
    console.log('google callback endpoint is working!');
    next();
  },
  passport.authenticate('google', { 
    successRedirect: '/',
    failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

// ======================================================================
//        Database Functions
// ======================================================================
const db = require('../database/index.js');

// ======================================================================
//   API month's events + venues -> Save to DB
//   API weekend's events ->  Client
// ======================================================================

app.get('/initialLoad', (req, res) => {
  const responseObj = {};
  let eventBriteData = [];

  const monthOptions = {
    method: 'GET',
    url: 'https://www.eventbriteapi.com/v3/events/search/',
    qs:
    {
      'start_date.range_start': '2017-11-28T00:00:00',
      'start_date.range_end': '2017-12-06T19:00:00',
      'location.address': 'san francisco',
      categories: '103,110,113,116,17001,104,105,102,118,108,109',
      page: 1,
    },
    headers: {
      authorization: APIKEY,
    },
  };

  const getCalls = () => new Promise((resolve, reject) => {
    request(monthOptions, (error, response, body) => {
      const page = JSON.parse(body).pagination.page_number;
      const parsedEvents = JSON.parse(body).events;
      if (!error) {
        eventBriteData = eventBriteData.concat(parsedEvents);
        if (page < 5) {
          monthOptions.qs.page += 1;
          resolve(getCalls());
        } else {
          resolve(eventBriteData);
        }
      } else {
        reject(error);
      }
    });
  });

  getCalls()
    .then(temp =>
      temp.map((event) => {
        const imageUrl = event.logo ? event.logo.url : 'https://cdn.evbstatic.com/s3-build/perm_001/f8c5fa/django/images/discovery/default_logos/4.png';
        const catID = event.subcategory_id === 17001 ? event.subcategory_id : event.category_id;
        const defaultPrice = event.is_free ? 'free' : 'paid';
        const eventName = `$$${event.name.text}$$`;
        const eventDesc = `$$${event.description.text}$$`;
        return {
          id: event.id,
          name: eventName,
          description: eventDesc,
          venue_id: event.venue_id,
          price: defaultPrice,
          url: event.url,
          image_url: imageUrl,
          start_datetime: event.start.local,
          end_datetime: event.end.local,
          category_id: catID,
          day: moment(event.start.local).format('dddd'),
        };
      }))
    .then((formattedEvents) => {
      db.addEvents(formattedEvents)
        .then(() => {
          db.getTodaysEvents()
            .then((data) => {
              responseObj.today = data.rows;
              res.json(responseObj);
            });
        });
    })
    .then(() => {
      app.get('/weekend', (req, res) => {
        getEvents.weekend()
          .then((data) => {
            res.json(data);
          });
      });
    });
});


// ======================================================================
//                    Query the DB on client filters
// ======================================================================
app.post('/filter', (request, response) => {
  const { date, price } = request.body;
  const categories = request.body.category;
  // const date = request.body.date;
  // const price = request.body.price;
  console.log('City works?', request.body.city)
  db.searchAllEvents(date, categories, price)
    .then((data) => {
      response.json(data);
    });
});


// ======================================================================
//                    Send today's data back to the client
// ======================================================================
app.get('/loadToday', (request, response) => {
  getEvents.today()
    .then((data) => {
      response.json(data);
    });
  // getTodayEventsDB
});
// ======================================================================
//                    load Venues to DB
// ======================================================================
app.get('/loadVenues', (request, response) => {
  getEvents.month()
    .then((data) => {
      response.json(data);
    });
});

// ======================================================================
//                    Run Server
// ======================================================================

module.exports = app.listen(PORT, () => {
  console.log(`BNVC Kick-It is listening on port ${PORT}!`);
});
