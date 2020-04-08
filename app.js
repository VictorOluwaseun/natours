const path = require("path");
const express = require('express');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const viewRouter = require("./routes/viewRoutes");

//Start express app
const app = express();

app.use(cors());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//1.GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, "public")));

//Set security HTTP headers
app.use(helmet()); //securing the http / https headers

//Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "You have exceeded the rate limit!"
});

// app.use(function (req, res, next) {
//   // res.header('Access-Control-Allow-Origin', req.headers.origin);
//   // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.header("Access-Control-Allow-Headers", "*");
//   // res.header('Access-Control-Allow-Credentials', true);
//   // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   next();
// });

app.use("/api", limiter);

// Body parser, reading the data from body into req.body
// app.use(express.json({
//   limit: "10kb"
// }));
app.use(express.json({
  limit: "10kb"
}));
app.use(express.urlencoded({
  extended: true, // to parse some complex data
  limit: "10kb"
})); //The way that form sends data to the server is also called urlencoded
app.use(cookieParser());
//use is used for middleware, to add middleware to middleware stack and the expess.json(), calling the json method simply a function and that function is added to a middleware stack 

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// "email": {"$gt": ""},
// 	"password": "pass1234"

// Data sanitization against XSS
app.use(xss()); //this cleans any user input from malicious HTML code basically

// Prevent parameter pollution
app.use(hpp({
  whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"]
}));

app.use(compression()); //To compress the request objects coming from the client


// app.use((req, res, next) => { // in each middleware function we have access to the req and res, and also the next function
//     console.log('...from middleware');
//     next();
// });

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  // console.log(req.cookies);
  // if (req.cookies.jwt === "loggedout") {
  //   res.render("/")
  //   return
  // }
  next();
});

// 3. ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); //let say there is an incoming request now, for /api/v1/tours/:id'. So the request goes into the middleware stack and when it hits that line of code there, it will match that url therefore the tourRouter middleware function will run.
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl} on this sever!`
  // }); 
  // This was commented out at implementing a Global Error Handling Middleware

  // const err = new Error(`Can't find ${req.originalUrl} on this sever!`);
  // err.status = 'fail';
  // err.statusCode = 404;


  // next(err); //next will be used in a special way. If next function recieves an arguement. No matter what we pass into next function. Express will automatically know that there was an error. It will assume that whatever we pass into next is an error. And that applies to every next function in every single middleware anywhere in our application. So, whenever anything is passed into next, it will assume that it is an error, and it will then skip all other middlewares in the middleware stack and send the error that we passed in to our global handling middleware, which will then ofcourse be executed.
  next(new AppError(`Can't find ${req.originalUrl} on this sever!`, 404));
});

app.use(globalErrorHandler); // Express already comes with middleware handlers out of the box. So, to define an error handling middleware, all to do is give the middleware function  for arguments and Express will then automatically recognize it as error handling middlware. And therefore, only call it when there is an error. This middleware function is an error first function

// const tourRouter = express.Router();

// 4.) Start Server
module.exports = app;