const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

connectToMongo();
const app = express();
const port = 3001; // at port 3000, react will be running

// Cors, to run api requests through browser
app.use(cors())

// Middleware for using req.body in the routes
app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// Shall be the last line in express... 
// Hosts it on the port mentioned
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});