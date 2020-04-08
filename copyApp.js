//jshint esversion: 8
const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');

const app = express();

//1.) Middlewares
app.use(morgan('dev'));

app.use(express.json()); //use is used for middleware, to add middleware to middleware stack and the expess.json(), calling the json method simply a function and that function is added to a middleware stack 

app.use((req, res, next) => { // in each middleware function we have access to the req and res, and also the next function
    console.log('...from middleware');
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});
// app
//     .get('/', (req, res) => {
//         res
//             .status(200)
//             .json({
//                 message: "this is comeing from server",
//                 app: 'tours app'
//             });
//     });

// app.post('/', (req, res) => {
//     res.send('You can post to this endpoint...');
// });

// const tours = JSON.parse(
//     fs.readFileSync(path.join(__dirname, 'dev-data/data', 'tours-simple.json'))
// );
// console.log(tours);

//2.) Route handlers
// const getAllTours = (req, res) => {
//     console.log(req.requestTime);
//     res.status(200).json({
//         status: 'success',
//         requestedAt: req.requestTime,
//         results: tours.length,
//         data: {
//             tours
//         }
//     });
// };

// const getTour = (req, res) => {
//     // console.log(req.params);
//     const id = req.params.id * 1;

//     const tour = tours.find(el => el.id === req.params.id * 1);

//     if (!tour) {
//         // return is optinal I think
//         return res.status(404).json({
//             status: 'fail',
//             message: `${id} is invalid`
//         });
//     }

//     // if (id > tours.length) {
//     //     return res.status(404).json({
//     //         status: 'fail',
//     //         message: `${id} is invalid`
//     //     });
//     // }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
// };

// const createTour = (req, res) => {
//     // console.log(req.body);
//     // console.log(req);

//     const newId = tours.length;
//     // const newId = tours[tours.length - 1].id + 1;
//     const newTour = Object.assign({
//         id: newId
//     }, req.body); // req.body.id could have been done but don't wanna mutate the original body Object

//     tours.push(newTour);

//     fs.writeFile(path.join(__dirname, 'dev-data/data', 'tours-simple.json'), JSON.stringify(tours), err => {
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 tour: newTour
//             }
//         });
//     });
// };

// const updateTour = (req, res) => {

//     if (req.params.id * 1 > tours.length - 1) {
//         // return is optinal I think
//         return res.status(404).json({
//             status: 'fail',
//             message: `Invalid ID`
//         });
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour: '<Updated tour>'
//         }
//     });
// };

// const deleteTour = (req, res) => {

//     if (req.params.id * 1 > tours.length - 1) {
//         // return is optinal I think
//         return res.status(404).json({
//             status: 'fail',
//             message: `Invalid ID`
//         });
//     }

//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
// };

// const getAllUsers = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };

// const getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };

// const createUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };

// const updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };

// const deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };


// the callback here is also called route handler

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id/', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3.) Routes
const tourRouter = express.Router();


// 4.) Start Server
const PORT = 3000;
app.listen(PORT, () => console.log("Server started"));