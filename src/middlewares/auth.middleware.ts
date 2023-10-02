import { NextFunction, Request, Response } from "express";

import { APPLICATION_CONFIG } from "../application-config";

export function authTokenMiddleware(req: Request, res: Response, next: NextFunction) {

    const xAuthToken = req.header('X-AUTH-TOKEN');
    const targetToken = APPLICATION_CONFIG().server.authToken;


    if (targetToken === '' || targetToken == null) {
        next();

    } else if (xAuthToken && xAuthToken === targetToken) {
        next();

    } else {
        return res.status(403).send('Permission denied');
    }   

}