import {NextFunction, Request, Response} from "express";
import jwt,{ JwtPayload } from "jsonwebtoken";
import { userModel } from "../models/userModel";

interface IUser{
    _id : string
}

interface AuthenticatedRequest extends Request {
    user?: IUser;
}



const requireAuth = async (request:AuthenticatedRequest, response:Response, next: NextFunction) => {

    const { authorization } = request.headers;

    if(!authorization){

        return response.status(401).json({ error: 'Authorization Header Required'});

    }

    const token: string = authorization.split(' ')[1];

    try{
        if (!process.env.SECRET) {
            throw new Error("JWT secret is not defined in the environment variables");
        }

        const { _id } = jwt.verify(token, process.env.SECRET) as JwtPayload;

        // Check if _id exists before using it
        if (!_id) {
            throw new Error("Invalid token: missing _id");
        }

        const user = await userModel.findById({_id}).select('_id');

        if(!user){
            throw new Error("Invalid ID attached to token");
        }

        request.user = { _id: user._id.toString() };
        next();

    }
    catch(err){
        console.log('Error: ', err);
        return response.status(401).json({ error: 'Request is not authorized'});
    }

}