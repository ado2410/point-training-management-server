import express from "express";
import { generateRoute } from "./template.actions";
import { createAction, deleteAction, importAction, insertAction, listAction, updateAction, viewAction } from "./template.constants";
import { TemplateRouteOptions } from "./template.types";

/**
 * Cấu trúc:
 * - middleware: Middleware chung của route, có ảnh hưởng đến tất cả các actions trong route
 * ----------------------------------------------------------------
 * - fetchOptions: Cài đặt kết quả trả về
 * ----------------------------------------------------------------
 * - list: Route trả về danh sách (vd: GET /users)
 * + excluded: Loại trừ route này
 * + middleware: Middleware của route này
 * + rules: Kiểm tra dữ liệu đầu vào bằng express-validator
 * + search: Các fields dùng để search
 * + query: các lệnh sql bổ sung query cho list
 * + custom: xây dựng sql thay thế
 * ----------------------------------------------------------------
 * - view: Route trả về một record (vd: GET /users/1)
 * + excluded: Loại trừ route này
 * + middleware: Middleware của route này
 * + rules: Kiểm tra dữ liệu đầu vào bằng express-validator
 * + custom: xây dựng sql thay thế
 * ----------------------------------------------------------------
 * - create: Các options cho fields (vd: GET /users/create)
 * + excluded: Loại trừ route này
 * + middleware: Middleware của route này
 * + rules: Kiểm tra dữ liệu đầu vào bằng express-validator
 * + options: List các options
 * ----------------------------------------------------------------
 * - import: Nhập dữ liệu từ danh sách (vd: POST /users/import)
 * + excluded: Loại trừ route này
 * + middleware: Middleware của route này
 * + rules: Kiểm tra dữ liệu đầu vào bằng express-validator
 * + custom: xây dựng sql thay thế
 * + fields: Lựa chọn các cột cần lấy
 * ----------------------------------------------------------------
 * - insert: Chèn record mới (vd: POST /users)
 * + excluded: Loại trừ route này
 * + middleware: Middleware của route này
 * + rules: Kiểm tra dữ liệu đầu vào bằng express-validator
 * + pre: Tiền xử lý trước khi thực hiện
 * + post: Hậu xử lý sau khi thục hiện
 * + custom: xây dựng sql thay thế
 * + fields: Lựa chọn các cột cần lấy
 * ----------------------------------------------------------------
 * - update: Cập nhật record (vd: PUT /users/1)
 * + excluded: Loại trừ route này
 * + middleware: Middleware của route này
 * + rules: Kiểm tra dữ liệu đầu vào bằng express-validator
 * + pre: Tiền xử lý trước khi thực hiện
 * + post: Hậu xử lý sau khi thục hiện
 * + custom: xây dựng sql thay thế
 * + fields: Lựa chọn các cột cần lấy
 * ----------------------------------------------------------------
 * - delete: Xoá record (vd: DELETE /users/1)
 * + excluded: Loại trừ route này
 * + middleware: Middleware của route này
 * + rules: Kiểm tra dữ liệu đầu vào bằng express-validator
 * + pre: Tiền xử lý trước khi thực hiện
 * + post: Hậu xử lý sau khi thục hiện
 * + custom: xây dựng sql thay thế
 * ----------------------------------------------------------------
 * - extra: Các custom route
 * + path: Đường dẫn
 * + rules: Kiểm tra dữ liệu đầu vào bằng express-validator
 * + method: GET POST PUT PATCH DELETE OPTIONS
 * + action: Function xử lý
 * + middleware: Middleware của route này
 */
export default (
    model: any,
    options: TemplateRouteOptions,
) => {
    let route = express.Router({mergeParams: true});
    const baseMiddleware = options.middleware || [];
    const baseRules = options.rules || [];

    //Lấy middleware
    const listMiddleware = options.list?.middleware?.concat(baseMiddleware) || baseMiddleware;
    const viewMiddleware = options.view?.middleware?.concat(baseMiddleware) || baseMiddleware;
    const importMiddleware = options.import?.middleware?.concat(baseMiddleware) || baseMiddleware;
    const createMiddleware = options.create?.middleware?.concat(baseMiddleware) || baseMiddleware;
    const insertMiddleware = options.insert?.middleware?.concat(baseMiddleware) || baseMiddleware;
    const updateMiddleware = options.update?.middleware?.concat(baseMiddleware) || baseMiddleware;
    const deleteMiddleware = options.delete?.middleware?.concat(baseMiddleware) || baseMiddleware;

    //Lấy rules
    const listRules = options.list?.rules?.concat(baseRules) || baseRules;
    const viewRules = options.view?.rules?.concat(baseRules) || baseRules;
    const importRules = options.import?.rules?.concat(baseRules) || baseRules;
    const createRules = options.create?.rules?.concat(baseRules) || baseRules;
    const insertRules = options.insert?.rules?.concat(baseRules) || baseRules;
    const updateRules = options.update?.rules?.concat(baseRules) || baseRules;
    const deleteRules = options.delete?.rules?.concat(baseRules) || baseRules;

    //Tạo các extra route
    options.extra?.forEach((extra) =>
        generateRoute(route, {
            method: extra.method,
            path: extra.path,
            middleware: [...baseMiddleware, ...extra.middleware || []],
            rules: [...baseRules, ...extra.rules || []],
            action: extra.action,
        })
    );

    //Tạo route list
    if (options.list?.excluded !== true && model)
        generateRoute(route, {
            method: "GET",
            path: "/",
            middleware: listMiddleware,
            rules: listRules,
            action: (req, res) => listAction(req, res, model, options),
        });

    //Tạo route create
    if (options.create?.excluded !== true && model)
        generateRoute(route, {
            method: "GET",
            path: "/create",
            middleware: createMiddleware,
            rules: createRules,
            action: (req, res) => createAction(req, res, model, options),
        });

    //Tạo route view
    if (options.view?.excluded !== true && model)
        generateRoute(route, {
            method: "GET",
            path: "/:id",
            middleware: viewMiddleware,
            rules: viewRules,
            action: (req, res) => viewAction(req, res, model, options),
        });

    //Tạo route import
    if (options.import?.excluded !== true && model)
        generateRoute(route, {
            method: "POST",
            path: "/import",
            middleware: importMiddleware,
            rules: importRules,
            action: (req, res) => importAction(req, res, model, options),
        });

    //Tạo route insert
    if (options.insert?.excluded !== true && model)
        generateRoute(route, {
            method: "POST",
            path: "/",
            middleware: insertMiddleware,
            rules: insertRules,
            action: (req, res) => insertAction(req, res, model, options),
        });

    //Tạo route update
    if (options.update?.excluded !== true && model)
        generateRoute(route, {
            method: "PUT",
            path: "/:id",
            middleware: updateMiddleware,
            rules: updateRules,
            action: (req, res) => updateAction(req, res, model, options),
        });

    //Tạo route delete
    if (options.delete?.excluded !== true && model)
        generateRoute(route, {
            method: "DELETE",
            path: "/:id",
            middleware: deleteMiddleware,
            rules: deleteRules,
            action: (req, res) => deleteAction(req, res, model, options),
        });

    return route;
}