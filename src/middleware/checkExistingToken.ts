import { Request, Response, NextFunction } from "express";
import jwt,{JwtPayload} from "jsonwebtoken";
import { userModel } from "../models/userModel";

const checkExistingToken = async (request: Request, response: Response, next: NextFunction): Promise<any> =>{

    const jwtToken = request.cookies.logincookie || request.cookies.signupcookie;

    if(!jwtToken){
        console.log("No token foound");
        return next()
    }

    try{
        if (!process.env.SECRET) {
            throw new Error("JWT secret is not defined in the environment variables");
        }
        const { _id } = jwt.verify(jwtToken, process.env.SECRET) as JwtPayload;
        // Check if _id exists before using it
        if (!_id) {
            throw new Error("Invalid token: missing _id");
        }

        console.log("Before checking for user if he/she exists");
        const user = await userModel.findById( _id );

        if(user){
            console.log("User Already Exists");
            return response.status(400).json({
                errors: {
                    message: 'User is already logged in. Log Out before you attempt to log in again'
                }
            });
        }

        return next();
    }
    catch(err){
        response.clearCookie('logincookie');
        response.clearCookie('signupcookie');
        console.log('Token verification error:', err);
        return next();
    }
}


export default checkExistingToken;