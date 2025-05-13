const userRoutes = require("../routes/user.route");

module.exports = (app) => {
    const version = "/api";

    app.use(version + "/users", userRoutes);
};