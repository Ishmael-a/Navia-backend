import { Request, Response}  from "express";
import mongoose from "mongoose";
import {cartModel} from "../models/cartModel";

interface CartRequestParams {
    userId: mongoose.Schema.Types.ObjectId;
}

interface CartRequestBody {
    items: {
        product: mongoose.Schema.Types.ObjectId,
        quantity: number
    }[],
    totalPrice: number,
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

export const getCarts = async(request: Request, response: Response): Promise<any> => {

    console.log('Getting Cart: /api/cart');

    try{

        const carts = await cartModel.find();
        return response.status(200).json(carts);

    }
    catch(err: any){

        console.log(`Error Getting Cart`, err);
        const errors = handleErrors(err);
        return response.status(400).json(errors);

    }

}

export const getCartById = async (request: Request<CartRequestParams, {}, {}, {}> ,response: Response): Promise<any> => {
    const { params: { userId } } = request;

    try{

        const cart = await cartModel.findOne({userId: userId}).populate('items.product');

        if (!cart) {
            return response.status(404).json({ error: 'Cart not found' });
        }
        console.log('Getting Cart With ID: /api/cart/', userId);
        return response.status(200).json(cart);

    }
    catch(err: any){
        console.log(`Error Getting Product`, err);
        const errors = handleErrors(err);
        return response.status(400).json(errors);
        
    }

}

export const addToCart = async (
    request: Request<CartRequestParams, {}, CartRequestBody, {}>,
    response: Response
  ): Promise<any> => {
    const { params: { userId }, body: { items } } = request;
    try {
      // Get cart with price calculations
      const cart = await cartModel.aggregate([
        // Match cart by userId
        {
          $match: { userId: userId }
        },
        // Unwind items array to work with individual items
        {
          $unwind: { path: "$items" }
        },
        // Lookup product details
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        // Unwind product details
        {
          $unwind: { path: "$productDetails" }
        },
        // Calculate price for each item
        {
          $addFields: {
            "items.ItemPrice": {
              $multiply: ["$items.quantity", "$productDetails.price"]
            }
          }
        },
        // Group items back together with total price
        {
          $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            items: { $push: "$items" },
            totalPrice: {
              $sum: "$items.ItemPrice"
            }
          }
        }
      ]);
      // Handle cart not found
      if (!cart || cart.length === 0) {
        return response.status(404).json({
          message: "Cart not found or could not be created."
        });
      }
      console.log(`Cart Updated for userId: ${userId}`);
      return response.status(200).json(cart[0]);
    } catch (err: any) {
      console.log('Error Adding To Cart', err);
      const errors = handleErrors(err);
      return response.status(400).json(errors);
    }
  };

// export const addToCart = async (request: Request<CartRequestParams, {}, CartRequestBody, {}>, response: Response): Promise<any> => {

//    const { params:{ userId }, body: {items} } = request;
   
//    try{
//         // const updatedCart = await cartModel.findOneAndUpdate(
//         //     { userId },
//         //     { items },
//         //     { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
//         // ).populate("items.product");

//         const cart = await cartModel.aggregate([
//             {
//                 $match: { userId:  userId }
//             },
//             {
//                 $unwind: { path: "$items" }
//             },
//             // {
//             //     $lookup: {
//             //         from: "products",
//             //         localField: "items.product",
//             //         foreignField: "_id",
//             //         as: "productDetails"
//             //     }
//             // },
//             // {
//             //     $unwind: { path: "$productDetails" }
//             // },
//             // {
//             //     $addFields: {
//             //         "items.ItemPrice": {
//             //             $multiply: ["$items.quantity","$productDetails.price"]
//             //         }
//             //     }
//             // },
//             // {
//             //     $group: {
//             //         _id: "$_id",
//             //         userId: { $first: "$userId" },
//             //         items: { $push: "$items" },
//             //         totalPrice: {
//             //             $sum: "$items.ItemPrice"  // Sum the total prices for all items
//             //         }
//             //     }
//             // }

//         ])

//         return response.status(cart ? 200 : 201).send(cart);
//         // if (!cart || cart.length === 0) {
//         //     return response.status(404).json({ message: "Cart not found or could not be created." });
//         // }

//         // console.log(`Cart Created/Updated for userId: `, userId);
//         // return response.status(cart ? 200 : 201).send(cart[0]);

//    }
//    catch(err:any){

//        console.log('Error Adding To Cart', err);
//        const errors = handleErrors(err);
//        return response.status(400).json(errors);

//    }
// }


// Update cart
export const updateCart = async (request: Request<CartRequestParams, {}, CartRequestBody, {}>, response: Response): Promise<any> => {
    const { params:{ userId }, body: {items, totalPrice}} = request;

    try {

        const updatedCart = await cartModel.findOneAndUpdate(
            { userId },
            { items, totalPrice },
            { new: true, runValidators: true }
        );

        if (!updatedCart) {
            return response.status(404).json({ error: 'Cart not found' });
        }

        return response.status(200).json(updatedCart);

    } catch (err:any) {
        console.log('Error Updating Cart', err);
        const errors = handleErrors(err);
        return response.status(400).json(errors);
        // return response.status(400).json({ error: err.message });
    }
};


// Clear cart
export const clearCart = async (request: Request<CartRequestParams>, response: Response):Promise<any> => {
    const { params:{ userId } } = request;
    try {

        const deletedCart = await cartModel.findOneAndDelete({ userId: userId });

        if (!deletedCart) {
            return response.status(404).json({ error: 'Cart not found' });
        }

        response.status(200).json({ message: 'Cart cleared successfully' });

    } catch (err:any) {

        console.log('Error Deleting Cart', err);
        const errors = handleErrors(err);
        return response.status(400).json(errors);

    }
};