import { Request, Response, NextFunction } from "express";
import { userModel } from "../models/userModel";
import mongoose from "mongoose";


interface CartRequestParams {
    userId: mongoose.Schema.Types.ObjectId;
}

const checkUserId = async (request: Request<CartRequestParams, {}, {}, {}> , response: Response, next: NextFunction): Promise<any> => {
    const { userId } = request.params;


    // Validate if userId is a valid ObjectId
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //     console.log("Invalid or missing userId");
    //     return response.status(400).json({ error: "Invalid or missing userId" });
    // }

    try{
        console.log("Inside checkUserId");
        const user = await userModel.findById({ _id: userId});
        if(!user){
            console.log("Inside checkUserId No user");
            return response.status(400).json({ error: 'UserId is not a valid UserId. Not found in Database'});
        }

        next();
    }
    catch(err:any){
        console.log('Error Checking User Id: ', err);
        return response.status(400).json({ error: 'UserId is not a valid UserId'});
    }

}

export default checkUserId;