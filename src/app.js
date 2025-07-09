const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const routesApi = require('./api/routes/index.route');

const setupAssociations = require('./config/setupAssociations');
setupAssociations();

const app = express();

// Connect Database
sequelize.authenticate()
    .then(() => console.log("Connected to MySQL database"))
    .catch(error => console.error("Database connection error", error));

// Cho phép tất cả các domain truy cập API
app.use(cors({
    origin: ["http://localhost:5173", "https://toeic-practice-eight.vercel.app"], // Cho phep hoat dong tren local va online
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());
// parse application/json
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
routesApi(app);

module.exports = app;

