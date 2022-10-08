import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Knex } from "knex";
import { getFetchOptions, searchQueryBuilder } from "./template.actions";
import { TemplateRouteOptions } from "./template.types";

//List
export const listAction = async (req: Request, res: Response, model: any, options: TemplateRouteOptions) => {
    const fetchOptions = await getFetchOptions(options.fetchOptions, req, res);
    const custom = options?.list?.custom;
    const query = options?.list?.query;
    const search = options?.list?.search;
    const orderBy = options?.list?.orderBy;
    const keyword = req.query.search as string;

    let data = null;
    if (custom)
        data = await custom(req, res);
    else {
        data = new model();
        data = await data.query(async (queryBuilder: Knex.QueryBuilder<any, any>) => {
            //query
            if (query) queryBuilder = query(queryBuilder, req, res);
            //Search
            if (search) {
                let searchFields: string[] = [];
                if (typeof search === 'function') searchFields = search(req, res);
                else searchFields = search;
                queryBuilder = searchQueryBuilder(queryBuilder, keyword, searchFields);
            }
            return queryBuilder;
        })
        data = data.orderBy(orderBy ? orderBy : "id", "DESC")
            .fetchAll(fetchOptions);
        data = await data;
    }
    return res.json({data: data});
};

//Create
export const createAction = async (req: Request, res: Response, model: any, options: TemplateRouteOptions) => {
    const _options = options?.create?.options;
    const results: Record<string, any> = {};

    if (_options === undefined) return res.json(results);
    for (const option of Object.keys(_options)) {
        let data = null;
        if (typeof _options[option] === "function")
           data =  await _options[option](req,res);
        else data = await _options[option];
        results[option] = data;
    }
    return res.json(results);
};

//View
export const viewAction = async (req: Request, res: Response, model: any, options: TemplateRouteOptions) => {
    const fetchOptions = await getFetchOptions(options.fetchOptions, req, res);
    const id = req.params.id;
    const custom = options?.view?.custom;

    let data = null;
    if (custom)
        data = await custom(req, res);
    else
        data = await new model({id: id}).fetch(fetchOptions);
    return res.json(data);
};

//Import
export const importAction = async (req: Request, res: Response, model: any, options: TemplateRouteOptions) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);

    const custom = options?.import?.custom;
    const fields = options?.import?.fields || [];
    let data = null;

    if (custom)
        data = await custom(req, res);
    else {
        const rows = req.body.map((row: Record<string, any>) => {
            const newRow: Record<string, any> = {};
            fields.map(field => newRow[field] = row[field]);
            return newRow;
        });
        data = await model.collection().add(rows).invokeThen('save');
    }
    return res.json(data);
};

//Insert
export const insertAction = async (req: Request, res: Response, model: any, options: TemplateRouteOptions) => {
    const fetchOptions = await getFetchOptions(options.fetchOptions, req, res);
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);

    const pre = options?.insert?.pre;
    const post = options?.insert?.post;
    const custom = options?.insert?.custom;
    const fields = options?.insert?.fields || [];
    let data = null;

    if (custom)
        data = await custom(req, res);
    else {
        if (pre) await pre(req, res);
        const row: Record<string, any> = {};
        fields.map(field => row[field] = req.body[field]);
        data = await new model(row).save();
        if (post) await post(data.toJSON(), req, res);
        data = await new model({id: data.id}).fetch(fetchOptions);
    }
    return res.json(data);
};

//Update
export const updateAction = async (req: Request, res: Response, model: any, options: TemplateRouteOptions) => {
    const fetchOptions = await getFetchOptions(options.fetchOptions, req, res);
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors);

    const id = req.params.id;
    const pre = options?.update?.pre;
    const post = options?.update?.post;
    const custom = options?.update?.custom;
    const fields = options?.update?.fields || [];
    let data = null;

    if (custom)
        data = await custom(req, res);
    else {
        if (pre) await pre(req, res);
        const row: Record<string, any> = {};
        fields.map(field => row[field] = req.body[field]);
        data = await new model({id: id}).save(row);
        if (post) await post(data.toJSON(), req, res);
        data = await new model({id: data.id}).fetch(fetchOptions);
    }
    return res.json(data);
};

//Delete
export const deleteAction = async (req: Request, res: Response, model: any, options: TemplateRouteOptions) => {
    const fetchOptions = await getFetchOptions(options.fetchOptions, req, res);
    const id = req.params.id;
    const pre = options?.delete?.pre;
    const post = options?.delete?.post;
    const custom = options?.delete?.custom;
    let data = null;

    if (custom)
        data = await custom(req, res);
    else {
        if (pre) await pre(req, res);
        data = await new model({id: id}).fetch(fetchOptions);
        await new model({id: id}).destroy();
        if (post) await post(data.toJSON(), req, res);
    }
    return res.json(data);
};