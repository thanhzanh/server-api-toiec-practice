const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const routesApi = require('./api/routes/index.route');

const app = express();

// Connect Database
sequelize.authenticate()
    .then(() => console.log("Connected to MySQL database"))
    .catch(error => console.error("Database connection error", error));

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());
// parse application/json
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
routesApi(app);

module.exports = app;

