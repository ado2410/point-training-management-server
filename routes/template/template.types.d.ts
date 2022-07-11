import Bookshelf from "bookshelf";
import { Request, Response } from "express";
import { ValidationChain } from "express-validator";

interface TemplateRoute {
    path: string;
    rules?: ValidationChain[];
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
    action: (request: Request, response: Response) => any;
    middleware?: ((req: Request, res: Response, next: NextFunction) => any)[];
}

interface ListTemplateRoute {
    excluded?: boolean;
    middleware?: ((req: Request, res: Response, next: NextFunction) => any)[];
    rules?: ValidationChain[];
    search?: ((request: Request, response: Response) => string[]) | string[];
    query?: (queryBuilder: Knex.QueryBuilder<any, any>, request: Request, response: Response) => Knex.QueryBuilder<any, any>;
    custom?: (request: Request, response: Response) => any;
    orderBy?: string;
}

interface ViewTemplateRoute {
    excluded?: boolean;
    middleware?: ((req: Request, res: Response, next: NextFunction) => any)[];
    rules?: ValidationChain[];
    custom?: (request: Request, response: Response) => any;
}

interface CreateTemplateRoute {
    excluded?: boolean;
    middleware?: ((req: Request, res: Response, next: NextFunction) => any)[];
    rules?: ValidationChain[];
    options?: Record<string, ((request: Request, response: Response) => any) | any>;
}

interface ImportTemplateRoute {
    excluded?: boolean;
    middleware?: ((req: Request, res: Response, next: NextFunction) => any)[];
    rules?: ValidationChain[];
    custom?: (request: Request, response: Response) => any;
    fields?: string[];
}

interface InsertTemplateRoute {
    excluded?: boolean;
    middleware?: ((req: Request, res: Response, next: NextFunction) => any)[];
    rules?: ValidationChain[];
    pre?: (request: Request, response: Response) => void;
    post?: (data: Record<string, any>[], request: Request, response: Response) => void;
    custom?: (request: Request, response: Response) => any;
    fields?: string[];
}

interface UpdateTemplateRoute {
    excluded?: boolean;
    middleware?: ((req: Request, res: Response, next: NextFunction) => any)[];
    rules?: ValidationChain[];
    pre?: (request: Request, response: Response) => void;
    post?: (data: Record<string, any>, request: Request, response: Response) => void;
    custom?: (request: Request, response: Response) => any;
    fields?: string[];
}

interface DeleteTemplateRoute {
    excluded?: boolean;
    middleware?: ((req: Request, res: Response, next: NextFunction) => any)[];
    rules?: ValidationChain[];
    pre?: (request: Request, response: Response) => void;
    post?: (data: Record<string, any>, request: Request, response: Response) => void;
    custom?: (request: Request, response: Response) => any;
}

interface TemplateRouteOptions {
    middleware?: ((req: Request, res: Response, next: NextFunction) => any)[];
    rules?: ValidationChain[];
    fetchOptions?: ((request: Request, response: Response) => (Promise<Bookshelf.FetchAllOptions> | Bookshelf.FetchAllOptions)) | Bookshelf.FetchAllOptions;
    list?: ListTemplateRoute;
    create?: CreateTemplateRoute;
    view?: ViewTemplateRoute;
    import?: ImportTemplateRoute;
    insert?: InsertTemplateRoute;
    update?: UpdateTemplateRoute;
    delete?: DeleteTemplateRoute;
    extra?: TemplateRoute[];
}