import { Request, Response}  from "express";
import mongoose from "mongoose";
import {orderModel} from "../models/orderModel";


interface OrderRequestBody {
    items: {
        product: mongoose.Schema.Types.ObjectId,
        quantity: number
    }[],
    totalPrice: number,
    status: 'pending'| 'processing' | 'shipped' | 'delivered',
}

interface OrderRequestParams {
    userId: mongoose.Schema.Types.ObjectId;
}


type CustomError = Error | mongoose.Error | mongoose.Error.ValidationError | mongoose.Error.CastError;

const handleErrors = (err: CustomError) => {
    const errors: Record<string, string> = {};

    if (err instanceof mongoose.Error.ValidationError) {
        Object.values(err.errors).forEach(({ path, message }) => {
            errors[path] = message;
        });
    }

    // Handle MongoDB duplicate key error (e.g., unique `userId`)
    if ((err as mongoose.Error).name === "MongoError" && (err as any).code === 11000) {
        errors.message = "Duplicate field value: UserId must be unique.";
    }

    // Handle CastError (invalid ObjectId)
    if (err instanceof mongoose.Error.CastError) {
        if (err.path === "userId") {
            errors.userId = "Invalid userId format.";
        }
        if (err.path === "items") {
            errors.product = "Invalid productId format.";
        }
    }

    // Handle generic error messages
    if (err instanceof Error) {
        errors.message = err.message;
    }


    return errors;
};



export const getOrders = async(request: Request, response: Response): Promise<any> => {

    console.log('Getting Orders: /api/orders');

    try{

        const orders = await orderModel.find();
        return response.status(200).json(orders);

    }
    catch(err: any){

        console.log(`Error Getting Orders`, err);
        const errors = handleErrors(err);
        return response.status(400).json(errors);

    }

}


export const getOrderById = async (request: Request<OrderRequestParams, {}, {}, {}> ,response: Response): Promise<any> => {
    const { params: { userId } } = request;

    try{

        const order = await orderModel.findOne({userId: userId}).populate('items.product');

        if (!order) {
            return response.status(404).json({ error: 'Order not found' });
        }
        console.log('Getting Order With ID: /api/order/', userId);
        return response.status(200).json(order);

    }
    catch(err: any){
        console.log(`Error Getting Order By ID`, err);
        const errors = handleErrors(err);
        return response.status(400).json(errors);
        
    }

}

export const addOrder = async (request: Request<OrderRequestParams, {}, OrderRequestBody, {}>, response: Response): Promise<any> => {

    const { params:{ userId }, body: {items, totalPrice}} = request;
    
    try{
         const updatedOrder = await orderModel.findOneAndUpdate(
             { userId },
             { items, totalPrice },
             { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
         ).populate("items.product");
 
         console.log(`Order Created/Updated for userId: `, userId);
         return response.status(updatedOrder ? 200 : 201).send(updatedOrder);
 
    }
    catch(err:any){
 
        console.log('Error Adding Order', err);
        const errors = handleErrors(err);
        return response.status(400).json(errors);
 
    }
}



// Update order
export const updateOrder = async (request: Request<OrderRequestParams, {}, OrderRequestBody, {}>, response: Response): Promise<any> => {
    const { params:{ userId }, body: {items, totalPrice}} = request;

    try {

        const updatedOrder = await orderModel.findOneAndUpdate(
            { userId },
            { userId, items, totalPrice },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return response.status(404).json({ error: 'Order not found' });
        }

        return response.status(200).json(updatedOrder);

    } catch (err:any) {
        console.log('Error Updating Order', err);
        const errors = handleErrors(err);
        return response.status(400).json(errors);
        // return response.status(400).json({ error: err.message });
    }
};

// Clear order
export const deleteOrder = async (request: Request<OrderRequestParams>, response: Response):Promise<any> => {
    const { params:{ userId } } = request;
    try {

        const deletedOrder = await orderModel.findOneAndDelete({ userId: userId });

        if (!deletedOrder) {
            return response.status(404).json({ error: 'Order not found' });
        }

        response.status(200).json({ message: 'Order cleared successfully' });

    } catch (err:any) {

        console.log('Error Deleting Order', err);
        const errors = handleErrors(err);
        return response.status(400).json(errors);

    }
};