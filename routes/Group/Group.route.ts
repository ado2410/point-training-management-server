import templateRoute from "../template/template.route";
import GroupModel from "../../models/GroupModel";
import { createOptions, fetchOptions, insertFields, insertRules, listQuery, listSearch, postInsert, preUpdate, updateFields, updateRules } from "./Group.constants";

export default templateRoute(GroupModel, {
    fetchOptions: fetchOptions,
    list: {
        search: listSearch,
        query: listQuery,
    },
    create: {
        options: createOptions,
    },
    insert: {
        rules: insertRules,
        fields: insertFields,
        post: postInsert,
    },
    update: {
        rules: updateRules,
        fields: updateFields,
        pre: preUpdate,
    },
});