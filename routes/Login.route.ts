import express from 'express';
import { asyncRoute } from '../utils/route';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel';

const route = express.Router({mergeParams: true});

route.post("/login", asyncRoute(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const accessTokenKey = process.env.ACCESS_TOKEN_KEY as jwt.Secret;
    const accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRATION;
    const model = new UserModel();
    const isInvalid = await model.where("username", username).where("password", password).count() === 0;
    if (isInvalid) return res.status(400).json({});

    const user = (await model.where("username", username).where("password", password).fetch({withRelated: ["student"]})).toJSON();
    const accessToken = jwt.sign(user, accessTokenKey, {expiresIn: accessTokenExpiration});

    return res.json({user: user, accessToken: accessToken});
}));

export default route;