// const fs = require('fs');
// const mongoose = require("mongoose");
// const dotenv = require('dotenv');
// const Tour = require("./../../models/tourModel");

// dotenv.config({
//     path: './../../config.env'
// });


// // const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// mongoose
//     // .connect(DB, {
//     .connect(process.env.DATABASE_LOCAL, {
//         useNewUrlParser: true,
//         useCreateIndex: true,
//         useFindAndModify: false
//     }).then(() => console.log("DB connection successful")); // console.log(con.connection)

// //READ JSON FILE
// const tours = JSON.parse(fs.readFileSync(__dirname + "/tours-simple.json", "utf-8"));
// // JSON.parse() to parse into javascript object

// //IMPORT DATA INTO DATABASE
// const importData = async () => {
//     try {
//         await Tour.create(tours);
//         console.log("Data successfully loaded");
//         process.exit();
//     } catch (err) {
//         console.log(err);
//     }
// };

// // DELETE ALL DATA FROM COLLECTION
// const deleteData = async () => {
//     try {
//         await Tour.deleteMany();
//         console.log("Data successfully deleted");
//         process.exit();
//     } catch (err) {
//         console.log(err);
//     }
// };

// // deleteData();
// // importData();
// if (process.argv[2] === '--import') {
//     importData();
// } else if (process.argv[2] === 'delete') {
//     deleteData();
// }

// console.log(process.argv);

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({
    path: './config.env'
});

const DB = process.env.DATABASE
// .replace(
//     '<PASSWORD>',
//     process.env.DATABASE_PASSWORD
// );

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('DB connection successful!'))
    .catch(e => console.log(e));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, {
            validateBeforeSave: false
        });
        await Review.create(reviews);
        console.log('Data successfully loaded!');
        console.log(Tour);

    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}