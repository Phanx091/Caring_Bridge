
const express = require('express');
require('dotenv').config();

const app = express();
const bodyParser = require('body-parser');
const sessionMiddleware = require('./modules/session-middleware');
const cron = require('node-cron');

// start up the mongo database
require('./modules/database');

const passport = require('./strategies/user.strategy');

// Route includes
const userRouter = require('./routes/user.router');
const siteRouter = require('./routes/site.router');
const profileRouter = require('./routes/profile.router');
const scanRouter = require('./routes/scan.router');

// Filter function
const runFilter = require('./modules/filter/filter');

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Passport Session Configuration //
app.use(sessionMiddleware);

// start up passport sessions
app.use(passport.initialize());
app.use(passport.session());

/* Routes */
app.use('/api/user', userRouter);
app.use('/api/site', siteRouter);
app.use('/api/profile', profileRouter);
app.use('/api/scan', scanRouter);

// Serve static files
app.use(express.static('build'));

// Get build for heroku deployment 
app.get('/*', (req, res) => {
  res.sendFile('/app/build/index.html');
});

// App Set //
const PORT = process.env.PORT || 5000;

// run filter at minute 0 every hour, and when server starts up
cron.schedule('0 * * * *', runFilter);
runFilter();

/** Listen * */
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
