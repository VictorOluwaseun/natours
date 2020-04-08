//modern view controllers architecture will be created
const fs = require('fs');
const path = require('path');
const Tour = require('./../models/tourModel');

const tours = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../dev-data/data', 'tours-simple.json'))
);

exports.checkID = (req, res, next, val) => {
    console.log('Tour id is :', val);
    if (req.params.id * 1 > tours.length - 1) {
        // return is optinal I think
        return res.status(404).json({
            status: 'fail',
            message: `Invalid ID`
        });
    }
    next();
};

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'fail',
            message: "Missing name or price"
        });
    }
    next();
};

//2.) Route handlers
exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
};

exports.getTour = (req, res, next) => {
    // console.log(req.params);
    const id = req.params.id * 1;

    const tour = tours.find(el => el.id === req.params.id * 1);

    // if (!tour) {
    //     // return is optinal I think
    //     return res.status(404).json({
    //         status: 'fail',
    //         message: `${id} is invalid`
    //     });
    // }

    // if (id > tours.length) {
    //     return res.status(404).json({
    //         status: 'fail',
    //         message: `${id} is invalid`
    //     });
    // }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
};

exports.createTour = (req, res) => {
    // console.log(req.body);
    // console.log(req);

    const newId = tours.length;
    // const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({
        id: newId
    }, req.body); // req.body.id could have been done but don't wanna mutate the original body Object

    tours.push(newTour);

    fs.writeFile(path.join(__dirname, 'dev-data/data', 'tours-simple.json'), JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    });
};

exports.updateTour = (req, res) => {

    // if (req.params.id * 1 > tours.length - 1) {
    //     // return is optinal I think
    //     return res.status(404).json({
    //         status: 'fail',
    //         message: `Invalid ID`
    //     });
    // }

    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour>'
        }
    });
};

exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
        data: null
    });
};