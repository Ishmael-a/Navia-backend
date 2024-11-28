import mongoose from "mongoose";

interface IOrder{
    userId: mongoose.Schema.Types.ObjectId,
    items: {
        product: mongoose.Schema.Types.ObjectId,
        quantity:number
    }[],
    totalPrice: number,
    status: 'pending'| 'processing' | 'shipped' | 'delivered',
    createdAt?: Date,
    updatedAt?: Date,
}

const orderSchema = new mongoose.Schema<IOrder>({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        unique: true,
        required: [true, "User ID is required for your Order" ]
    },
    items: [
      {
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'product', 
            required: [true,"Products are Required For your Order"] 
        },
        quantity: { 
            type: Number, 
            required: [true, "Quantity Of Products are required for your order"],
            min: [1, "Quantity of product must be at least 1."],
        },
      },
    ],
    totalPrice: { 
        type: mongoose.Schema.Types.Number, 
        required: [true, "A price for the product is required"],
        min: [0, "Total price must be a positive number."], 
        default: 0 
    },
    status: { 
        type: mongoose.Schema.Types.String, 
        enum: ['pending', 'processing', 'shipped', 'delivered'], 
        default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });



export const orderModel = mongoose.model<IOrder>('order', orderSchema);