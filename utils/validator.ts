import { Knex } from "knex";

export const exists = async (
    model: any,
    column: string,
    value: any,
    ignoreIds: number[] = [],
    qb: ((queryBuilder: Knex.QueryBuilder<any, any>) => (Knex.QueryBuilder<any, any> | Promise<Knex.QueryBuilder<any, any>>)) | undefined = undefined
) => {
    let count = await new model()
        .where(column, value)
        .where("id", "not in", ignoreIds);
    if (qb !== undefined) count = await qb(count);
    count = await count.count();
    if (count === 0) return Promise.reject();
    else return Promise.resolve();
};

export const duplicate = (
    field: string,
    value: any,
    data: Record<string, any>[]
) => {
    const values = data.filter((item) => item[field] === value);
    if (values.length > 1) return true;
    else return false;
};
