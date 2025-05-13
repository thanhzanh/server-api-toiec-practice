const authRoutes = require("./auth.route");

module.exports = (app) => {
    const version = "/api";

    app.use(version + "/auth", authRoutes);
};