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

// Cho phép tất cả các domain truy cập API
app.use(cors({
    origin: "http://localhost:5173", // Đổi thành domain frontend của bạn
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
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

