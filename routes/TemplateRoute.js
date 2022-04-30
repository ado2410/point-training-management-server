const express = require("express");
const {asyncRoute} = require("../utils/route");
const {validationResult} = require("express-validator");

module.exports = (
    model,
    options,
) => {
    const route = express.Router({mergeParams: true});

    route.get("/", asyncRoute(async (req, res) => {
        let data = null;
        if (options?.list?.fetch)
            data = (await options.list.fetch(req, res))
        else data = await new model()
            .query(qb => {
                if (options.fetchOptions?.search && req.query.search)
                    options.fetchOptions?.search.forEach(column => qb.orWhere(column, "ilike", `%${req.query.search}%`));
                return qb;
            })
            .orderBy("created_at", "DESC")
            .fetchAll(options?.fetchOptions || {});
        return res.json({data: data});
    }));

    route.get("/create", asyncRoute(async (req, res) => {
        const results = {};
        for (const option of Object.keys(options.create.options)) {
            let data = null;
            if (typeof options.create.options[option] === "function")
               data =  await options.create.options[option](req,res);
            else data = options.create.options[option];
            results[option] = data;
        }
        return res.json(results);
    }));

    route.get("/:id", asyncRoute(async (req, res) => {
        const data = await new model({id: req.params.id}).fetch(options?.fetchOptions || {});
        return res.json(data);
    }));

    route.post("/", options.insert?.rules || [], asyncRoute(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors);
        const fields = {};
        options.insert.fields.map(field => fields[field] = req.body[field]);
        const result = await new model(fields).save();
        const data = await new model({id: result.id}).fetch(options?.fetchOptions || {});
        return res.json(data);
    }));

    route.put("/:id", options.update?.rules || [], asyncRoute(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors);
        const fields = {};
        options.update.fields.map(field => fields[field] = req.body[field]);
        const result = await new model({id: req.params.id}).save(fields);
        const data = await new model({id: result.id}).fetch(options?.fetchOptions || {});
        return res.json(data);
    }));

    route.delete("/:id", asyncRoute(async (req, res) => {
        const result = await new model({id: req.params.id}).destroy();
        return res.json(result);
    }));

    return route;
}