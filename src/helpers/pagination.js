
const createPaginationQuery = (objectPagination, query, countRecords) => {
    if (query.page) {
        objectPagination.currentPage = parseInt(query.page);
    }

    if (query.limit) {
        objectPagination.limitItem = parseInt(query.limit);
    }

    // Bỏ qua bao nhiêu bản ghi
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItem;

    // Tổng số bản ghi
    objectPagination.totalPage = Math.ceil(countRecords/objectPagination.limitItem);

    return objectPagination;
};

module.exports = { createPaginationQuery };