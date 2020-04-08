const fs = require('fs');
const path = require('path');
const express = require('express');

const tours = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../dev-data/data', 'tours-simple.json'))
);

//2.) Route handlers
const getAllTours = (req, res) => {
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

const getTour = (req, res) => {
    // console.log(req.params);
    const id = req.params.id * 1;

    const tour = tours.find(el => el.id === req.params.id * 1);

    if (!tour) {
        // return is optinal I think
        return res.status(404).json({
            status: 'fail',
            message: `${id} is invalid`
        });
    }

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

const createTour = (req, res) => {
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

const updateTour = (req, res) => {

    if (req.params.id * 1 > tours.length - 1) {
        // return is optinal I think
        return res.status(404).json({
            status: 'fail',
            message: `Invalid ID`
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour>'
        }
    });
};

const deleteTour = (req, res) => {

    if (req.params.id * 1 > tours.length - 1) {
        // return is optinal I think
        return res.status(404).json({
            status: 'fail',
            message: `Invalid ID`
        });
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
};

const router = express.Router();

router
    .route('/')
    .get(getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;