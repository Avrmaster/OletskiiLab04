const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const path = require('path');
require('dotenv').config();

const indexRouter = require('./routes');
const adminRouter = require('./routes/admin');
const app = express();

const initOptions = {
    error (error, e) {
        console.error(error.message || error);
        if (e.cn)
            console.log('cn:', e.cn);
    },
};

const pgp = require('pg-promise')(initOptions);
const db = pgp('postgres://postgres:postgres@localhost:5432/oletskiidb4');

//test db connection during app's startup
db.connect()
    .then(obj => {
        // connected
        obj.done();
    })
    .catch(error => {
        console.log('COULDN\'T CONNECT TO DATABASE:', error.message || error);
    });

// Headers appending
app.use(function (req, res, next) {
    Object.entries({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
        'Access-Control-Allow-Credentials': true,
    }).map(([key, value]) => res.setHeader(key, value));
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = {app, db};
