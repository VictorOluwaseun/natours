const mongoose = require("mongoose");
const dotenv = require('dotenv');

process.on("uncaughtException", err => {
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    process.exit(1);
    // server.close(() => { //Server was created because it was needed here 
    //     process.exit(1);
    // });
});

dotenv.config({
    path: './config.env'
});

const app = require('./app');

const DB = process.env.DATABASE
// .replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    // .connect(DB, {
    .connect(process.env.DATABASE_LOCAL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => console.log("DB connection successful"));
// .catch(err => console.log("err")); // console.log(con.connection)

// console.log(app.get('env'));
// console.log(process.env.NODE_ENV);

const PORT = process.env.PORT || 3000;
// const HOSTNAME = "127.0.0.1";
const server = app.listen(PORT, () => console.log("Server started"));

//Event and event listerners    .It's time to actually use the knowledge 
//So each time there is unhandled rejection somewhere in our application. the process object will emit an object called unhandeled rejection and so we can subscribe. 

// process.on("unhandledRejection", err => {
//     console.log(err.name, err.message);
// });

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    server.close(() => { //Server was created because it was needed here 
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    console.log("👋 SIGTERM RECIEVED. Shutting down properly");
    server.close(() => { //All the pending requests will process until the end
        console.log("💥 Process terminated"); //SIGTERM will case it to shutdown so we do no need process.exit(1)
    });
})