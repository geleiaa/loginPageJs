const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env'});
const pug = require('pug');
const cookieParser = require('cookie-parser');

const userRouter = require('./userRoutes');
const viewRouter = require('./viewRoutes');
const globErrHandler = require('./../controllers/errorControll');

const app = express();

mongoose.set('strictQuery', true);// remove warning

// pug templates
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views')); 
app.use(express.static(path.join(__dirname, '../statics')));


// sec http headers
app.use(helmet.contentSecurityPolicy({
    directives: {
        "default-src": ["'self'"],//helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
        "script-src": ["'self'", "https://cdn.jsdelivr.net/npm/axios@1.1.2/dist/axios.min.js"]
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow" } 
  })
); 

//log req no console
if(process.env.NODE_ENV === 'development'){
app.use(morgan(':method :url :status :referrer :remote-addr :res[content-length] - :response-time ms'));
};

// rate-limit mid
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Você bateu o rate-limit kkkk'
});
app.use('/api', limiter);

//body-parser and cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // para o form action
app.use(cookieParser());


// query sanitize
app.use(mongoSanitize());

// xss prevent
app.use(xss());

// prevent parameter polution
app.use(hpp({whitelist:[
    'name',
    'type',
    'size',
    'price',
    'ratingAverage'
]}));

//date test mid
app.get((req, res, next) =>{
    req.reqTime = new Date().toString();
    console.log(req.cookie);
    next();
})

app.get('/', (req, res) =>{
    res.status(200).render('base');
});

app.use('/', viewRouter);
app.use('/api/v1/user', userRouter);


// default error
app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'Fail!!!',
        message: `Not Found ${req.originalUrl}`
    });
});

app.use(globErrHandler); // errorControll 

module.exports = app;