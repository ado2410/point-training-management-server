const asyncRoute = f => (req, res, next) => {
    return Promise.resolve(f(req, res, next)).catch(next);
};

module.exports = {
    asyncRoute: asyncRoute,
}