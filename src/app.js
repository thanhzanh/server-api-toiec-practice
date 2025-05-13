const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const routesApi = require('./api/routes/index.route');

const app = express();

// Connect Database
sequelize.authenticate()
    .then(() => console.log("Connected to MySQL database"))
    .catch(error => console.error("Database connection error", error));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
routesApi(app);

module.exports = app;

