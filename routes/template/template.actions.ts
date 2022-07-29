import Bookshelf from "bookshelf";
import { Request, Response, Router } from "express";
import { Knex } from "knex";
import { asyncRoute } from "../../utils/route";
import { TemplateRoute } from "./template.types";

export const getFetchOptions = async (
    fetchOptions:
        | ((request: Request, response: Response) => Promise<Bookshelf.FetchAllOptions> | Bookshelf.FetchAllOptions)
        | Bookshelf.FetchAllOptions
        | undefined,
    request: Request,
    response: Response
) => {
    if (fetchOptions === undefined) return {};
    if (typeof fetchOptions === "function")
        return await fetchOptions(request, response);
    else return fetchOptions;
};

export const generateRoute = (route: Router, routeOption: TemplateRoute) => {
    const method = routeOption.method;
    const path = routeOption.path;
    const middleware = routeOption.middleware || [];
    const rules = routeOption.rules || [];
    const action = routeOption.action;
    switch (method) {
        case "GET":
            route.get(path, ...middleware, rules, asyncRoute(async (req, res) => await action(req, res)));
            break;
        case "POST":
            route.post(path, ...middleware, rules, asyncRoute(async (req, res) => await action(req, res)));
            break;
        case "PUT":
            route.put(path, ...middleware, rules, asyncRoute(async (req, res) => await action(req, res)));
            break;
        case "PATCH":
            route.patch(path, ...middleware, rules, asyncRoute(async (req, res) => await action(req, res)));
            break;
        case "DELETE":
            route.delete(path, ...middleware, rules, asyncRoute(async (req, res) => await action(req, res)));
            break;
        case "OPTIONS":
            route.options(path, ...middleware, rules, asyncRoute(async (req, res) => await action(req, res)));
            break;
    }
    return route;
}

export const searchQueryBuilder = (
    queryBuilder: Knex.QueryBuilder<any, any>,
    keyword: string,
    searchFields: string[]
) => {
    queryBuilder = queryBuilder.whereWrapped(whereQueryBuilder => {
        if (keyword) {
            if (searchFields) searchFields.forEach(column => whereQueryBuilder.orWhere(column, "ilike", `%${keyword}%`));
        }
        return whereQueryBuilder;
    });
    return queryBuilder;
}