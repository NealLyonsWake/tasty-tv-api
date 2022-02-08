require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const cors = require('cors')
const mongoose = require('mongoose')

require('./middleware/auth')

const mongooseURI = process.env.MONGODB
mongoose.connect(mongooseURI)

const indexRouter = require('./routes/index');
const accountRouter = require('./routes/account');
const watchRouter = require('./routes/watch');
const reviewRouter = require('./routes/reviews')
const commentRouter = require('./routes/comments')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', 1)

app.use(
  cors(
    {
    credentials: true,
    origin: 'https://tasty-tv-frontend.herokuapp.com'
  }
  )
)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/account', accountRouter);
app.use('/watch', watchRouter);
app.use('/review', reviewRouter);
app.use('/comment', commentRouter);



app.use(passport.initialize)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
