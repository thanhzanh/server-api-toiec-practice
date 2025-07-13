const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");
const questionRoutes = require("./question.route");
const passageRoutes = require("./passage.route");
const examRoutes = require("./exam.route");
const resultRoutes = require("./result.route");
const roleRoutes = require("./role.route");
const permissionRoutes = require("./permission.route");
const categoryRoutes = require("./category.route");
const blogRoutes = require("./blog.route");
const categoryGrammarRoutes = require("./categoryGrammar.route");
const grammarRoutes = require("./grammar.route");

module.exports = (app) => {
    const version = "/api";

    app.use(version + "/auth", authRoutes);

    app.use(version + "/users", userRoutes);

    app.use(version + "/questions", questionRoutes);

    app.use(version + "/passages", passageRoutes);

    app.use(version + "/exams", examRoutes);

    app.use(version + "/results", resultRoutes);

    app.use(version + "/roles", roleRoutes);

    app.use(version + "/permissions", permissionRoutes);

    app.use(version + "/categorys", categoryRoutes);

    app.use(version + "/blogs", blogRoutes);

    app.use(version + "/grammars", grammarRoutes);

    app.use(version + "/category-grammars", categoryGrammarRoutes);

};