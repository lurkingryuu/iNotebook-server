const mongoose = require('mongoose'); // mongoose library for easy setup of mongoDB
const mongoURI = "mongodb://localhost:27017/iNotebook"; // Local server 

// An async await function in which mongoose.connect is called
const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        // This may not be a call back function...
        console.log("Connected to the Database");
    });
}

// Exporting the function of connection to MongoDB
module.exports = connectToMongo;