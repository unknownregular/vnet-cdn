const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

// Original route imports
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// New route imports for streaming CDN
const mediaRouter = require('./routes/media');
const channelRouter = require('./routes/channels');
const scheduleRouter = require('./routes/schedule');

// Import database utilities
const { initializeDatabase } = require('./utils/database');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize streaming CDN database
initializeDatabase();

// Mount original routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Mount streaming CDN routes
app.use('/api/media', mediaRouter);
app.use('/api/channels', channelRouter);
app.use('/api/schedule', scheduleRouter);

// Serve static files for streams
app.use('/streams', express.static('streams'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;