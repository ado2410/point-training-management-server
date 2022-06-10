const exists = async (model, column, value, ignoreIds = [], qb = null) => {
    let count = await new model().where(column, value).where("id", "not in", ignoreIds);
    if (qb) count = qb(count);
    count = await count.count();
    if (count === 0) return Promise.reject();
    else return Promise.resolve();
}

const duplicate = (field, value, data) => {
    const values = data.filter(item => item[field] === value);
    if (values.length > 1) return true;
    else return false;
}

module.exports = {
    exists: exists,
    duplicate: duplicate
}