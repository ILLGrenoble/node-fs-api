import { NextFunction, Request, Response } from "express";

import { APPLICATION_CONFIG } from "../application-config";

const getCaseInsensitiveHeader = (header: string, req: Request): string => {
    const lowerCaseHeader = header.toLowerCase();
    for (const requestHeader in req.headers) {
        if (requestHeader.toLowerCase() === lowerCaseHeader) {
            return req.header(requestHeader);
        }
    }
}

export function authTokenMiddleware(req: Request, res: Response, next: NextFunction) {

    const xAuthToken = getCaseInsensitiveHeader('x-auth-token', req);
    const targetToken = APPLICATION_CONFIG().server.authToken;

    if (targetToken === '' || targetToken == null) {
        next();

    } else if (xAuthToken && xAuthToken === targetToken) {
        next();

    } else {
        return res.status(403).send('Permission denied');
    }   

}