const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");
const questionRoutes = require("./question.route");
const passageRoutes = require("./passage.route");
const examRoutes = require("./exam.route");

module.exports = (app) => {
    const version = "/api";

    app.use(version + "/auth", authRoutes);

    app.use(version + "/users", userRoutes);

    app.use(version + "/questions", questionRoutes);

    app.use(version + "/passages", passageRoutes);

    app.use(version + "/exams", examRoutes);

};