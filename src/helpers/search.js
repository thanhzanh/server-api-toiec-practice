const { Op } = require('sequelize');

const createSearchQuery = (search, searchFields) => {
    if (!search || !searchFields.length) return {};

    const where = {
        [Op.or]: searchFields.map((item) => ({
            [item]: {
                [Op.like]: `%${search.trim()}%`
            }
        }))
    }

    return where;
};

module.exports = { createSearchQuery };