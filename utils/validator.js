const exists = async (model, value, column = "id", ignoreIds = []) => {
    const count = await new model().where(column, value).where("id", "not in", ignoreIds).count();
    if (count === 0) return Promise.reject();
    else return Promise.resolve();
}

const duplicate = (value, field, data) => {
    const values = data.filter(item => item[field] === value);
    if (values.length > 1) return true;
    else return false;
}

module.exports = {
    exists: exists,
    duplicate: duplicate
}