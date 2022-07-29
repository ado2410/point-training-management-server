import MajorModel from "../../models/MajorModel";
import templateRoute from "../template/template.route";
import { createOptions, fetchOptions, insertAndUpdateFields, insertAndUpdateRules, listQuery, listSearch } from "./Major.constants";

export default templateRoute(MajorModel, {
    fetchOptions: fetchOptions,
    list: {
        search: listSearch,
        query: listQuery,
    },
    create: {
        options: createOptions,
    },
    insert: {
        rules: insertAndUpdateRules,
        fields: insertAndUpdateFields,
    },
    update: {
        rules: insertAndUpdateRules,
        fields: insertAndUpdateFields,
    },
});