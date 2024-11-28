import mongoose from "mongoose";
import validator from "validator";

interface IProduct{
    name: string,
    description: string,
    price: number,
    image: string,
    category: string,
    createdAt?: Date,
    updatedAt?: Date
}

const productSchema = new mongoose.Schema<IProduct>({

    name: {
        type: mongoose.Schema.Types.String,
        // unique: true,
        required: [true, "A Product Name is required"],
        minLength: [1, "The product should have a minimum length of one character."],
    },
    description: {
        type: mongoose.Schema.Types.String,
        required: [true, "A Product Description is required"],
        minLength: [10, "The product description should have a minimum length of 10 characters."],
    },
    price: {
        type: mongoose.Schema.Types.Number,
        required: [true, "A Product Description is required"],
        min: [0, "Price must be a positive number"],
    },
    image: {
        type: mongoose.Schema.Types.String,
        // unique: true,
        required: [true, "A Product Image is required"],
        validate: {
            validator: (value: string) => {
                // Change this if images are stored as local paths
                return validator.isURL(value, { 
                    protocols: ['http', 'https'],
                    require_protocol: true,
                    allow_underscores: true,
                    allow_trailing_dot: false,
                 }) || /^http:\/\/localhost/.test(value) // Allow localhost URLs;
            },
            message: "Invalid URL format for image",
        },
    },
    category: {
        type: mongoose.Schema.Types.String,
        required: [true, "A Product Category is required"],
    },
    createdAt: { 
        type: mongoose.Schema.Types.Date, 
        default: Date.now ,
    },
    updatedAt: { 
        type: mongoose.Schema.Types.Date, 
        default: Date.now ,
    },

})

productSchema.post('save', function (document, next){
    console.log("Product has been saved to the database ");
    next();
})

productSchema.pre('save', async function (next){
    console.log("Product is about to be saved to the database ");
    next();
})


export const productModel = mongoose.model<IProduct>('product', productSchema);
