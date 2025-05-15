const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");

module.exports = (app) => {
    const version = "/api";

    app.use(version + "/auth", authRoutes);

    app.use(version + "/users", userRoutes);

};