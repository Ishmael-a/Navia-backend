import {Request, Response} from 'express';
import mongoose from 'mongoose';
import { userModel } from '../models/userModel';
import jwt from "jsonwebtoken";
import { sign } from 'crypto';



type CustomError = Error | mongoose.Error | mongoose.Error.ValidationError;

const handleErrors = (err: CustomError) => {
    const errors = { username: "", email: "", password: "" };

    // Check for Mongoose validation errors
    if (err instanceof mongoose.Error.ValidationError) {
        // Loop over the validation errors and set custom messages
        Object.values(err.errors).forEach(({ path, message }) => {
            errors[path as keyof typeof errors] = message;
        });
    }
    
    if ((err as mongoose.Error).name === "MongoError" && (err as any).code === 11000) {
        if ((err as any).keyPattern.username) {
            errors.username = "This username is already taken";
        }
        if ((err as any).keyPattern.email) {
            errors.email = "This email is already registered";
        }
    }


    //custom errors when a field is not filled
    try {
        const parsedError = JSON.parse(err.message);
        if (parsedError.username || parsedError.email || parsedError.password) {
            const error = { ...errors, ...parsedError };
            return error;
        }
    } catch (parseError) {
        // Handle the error if parsing fails (optional)
        console.error('Error parsing message:', parseError);
    }

    // Handle any other generic error
    if (err instanceof Error) {
        if(err.message === "Enter A valid Email"){
            errors.email = err.message;
        }
        if(err.message === "Password is not strong enough"){
            errors.password = err.message;
        }
        if(err.message === "Username already exists"){
            errors.username = err.message;
        }
        if(err.message === "Email already exists"){
            errors.email = err.message;
        }
        if(err.message === "incorrect email"){
            errors.email = err.message;
        }
        if(err.message === "incorrect password"){
            errors.password = err.message;
        }
    }

    return errors;
};

interface RequestParams {
    id: string;
}

interface ResponseBody {}

interface RequestBody {
    username: string,
    email: string,
    password: string,
    role: "user"|"admin",
}
interface LoginRequestBody {
    email: string,
    password: string,
    role: "user"|"admin",
}

interface RequestQuery {
  id: string;
}


const createToken = (_id: string) => {

    if (!process.env.SECRET) {
        throw new Error("JWT secret is not defined in the environment variables");
    }

    return jwt.sign({_id}, process.env.SECRET , { expiresIn: 24 * 60 * 60});
};

export const getUsers = async (request: Request, response: Response) : Promise<any> => {

    console.log('Getting All Users: /api/users');

    try{
        const allUsers = await userModel.find();
        return response.status(200).send(allUsers);
    }
    catch(Err){
        console.log("Error Getting Users: ",Err);
        return response.status(400).json({ error: "Error Getting Users" });
    }

}

export const registerUser_get =  (request: Request, response: Response) =>{ 

    response.send({message: "Register A User"});

}

export const registerUser_post = async (request: Request<{}, ResponseBody, RequestBody, {}>, response: Response):Promise<any> =>{ 
    const { body } = request;

    try{
        console.log("Inside registering User");
        const newUser = await userModel.signup(body);
        const jwtToken = createToken(newUser._id.toString());
        response.cookie('signupcookie', jwtToken, { httpOnly: true ,maxAge: 24 * 60 * 60 * 1000 });

        return response.status(200).json({ username: newUser.username, token: jwtToken });
    }
    catch(err: unknown){
        console.log("Raw Error Signing Up, ", err);
        let errors;

        if (err instanceof Error || err instanceof mongoose.Error || err instanceof mongoose.Error.ValidationError) {
            errors = handleErrors(err);
            console.log("Errors After Handling Errors", errors); 
        } else {
            // Default error handling if it's an unexpected type
            errors = { message: "An unknown error occurred" };
        }

        return response.status(400).json({errors: errors});
    }

}

export const loginUser_get =  (request: Request, response: Response) =>{ 

    response.send({message: "Login A User: GET"});

}


export const loginUser_post = async (request: Request<{}, ResponseBody, LoginRequestBody, {}>, response: Response): Promise<any> =>{ 

    const { body } = request;

    try{

        const newUser = await userModel.login(body);

        const jwtToken = createToken(newUser._id.toString());
        response.cookie('logincookie', jwtToken, { httpOnly: true ,maxAge: 24 * 60 * 60 * 1000});

        return response.status(200).json({username: newUser.username, token: jwtToken});
    }
    catch(err){
        console.log("Raw Error Logging Up, ", err);
        let errors;

        if (err instanceof Error || err instanceof mongoose.Error || err instanceof mongoose.Error.ValidationError) {
            errors = handleErrors(err);
        } else {
            // Default error handling if it's an unexpected type
            errors = { message: "An unknown error occurred" };
        }

        return response.status(400).json({errors: errors});
    }

}