import mongoose from "mongoose";

interface ICart{
    userId: mongoose.Schema.Types.ObjectId,
    items: {
        product: mongoose.Schema.Types.ObjectId,
        quantity: number
    }[],
    totalPrice: number,
    createdAt?: Date,
    updatedAt?: Date
}

const cartSchema = new mongoose.Schema<ICart>({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        unique: true,
        required: [true, "User ID is required for the cart" ]
    },
    items: [
      {
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'product', 
            required: [true,"Products are Required For the Cart"] 
        },
        quantity: { 
            type: Number, 
            required: [true, "Quantity Of Products are required"],
            min: [1, "Quantity must be at least 1."],
        },
      },
    ],
    totalPrice: { 
        type: mongoose.Schema.Types.Number, 
        required: [true, "A price for the product is required"],
        min: [0, "Total price must be a positive number."], 
        default: 0 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
});


export const cartModel = mongoose.model<ICart>('cart', cartSchema);