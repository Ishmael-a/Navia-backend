import { Request, Response}  from "express";
import Router from "express";
import {productModel} from "../models/productModel"

interface RequestParams {
    id: string;
}

interface ResponseBody {}

interface RequestBody {
    name: string,
    description: string,
    price: number,
    image: string,
    category: string,
}

interface RequestQuery {
  id: string;
}

export const products_get = async(request: Request, response: Response): Promise<any> => {

    console.log('Getting All Products: /api/products');

    try{
        const allProducts = await productModel.find();
        return response.status(200).json(allProducts);
    }
    catch(err){
        console.log(`Error `, err);
        return response.status(400);
    }

}

export const products_getByID = async (request: Request<RequestParams, {}, {}, {}> ,response: Response): Promise<any> => {
    const {params: {id}} = request;

    
    try{
        const product = await productModel.findById(id);
        console.log('Getting Product With ID: /api/products/', id);
        return response.status(200).json(product);
    }
    catch(err){
        console.log(`Error Getting Product`, err);
        return response.status(400);
        
    }

}

export const products_post = async (request: Request<{}, ResponseBody, RequestBody, {}>,
     response: Response): Promise<any> => {

    const { body, file } = request;
    
    if (!file) {
        return response.status(400).send({ error: "Image file is required" });
    }
    
    try{
        const imageUrl = `http://localhost:3000/images/${file.filename}`;
        console.log(`Image Url ${imageUrl}`);
        const product = new productModel({
                ...body,
                image: imageUrl, // Storing the image path or URL
            });
        const newProduct = await product.save();
        console.log('Posting Product With ID: /api/products/' + newProduct._id);
        return response.status(201).send(newProduct);
    }
    catch(err){
        console.log('Error Creating Product', err);
        return response.status(400).send({error: "Product Not Created"});
    }
}



export const products_putByID = async (request: Request<RequestParams, {}, RequestBody, {}> ,response: Response): Promise<any> => {
    const { body, params: { id }} = request;

    try{
        const updatedProduct = await productModel.findByIdAndUpdate(
            { id },
            {
                name: body.name,
                description: body.description,
                price: body.price,
                image: body.image,
                category: body.category,
            },
            {
                new: true,       // Returns updated document
                overwrite: true  // Replaces the document
            }
        );
        console.log('Updating Product: /api/products/'+ id);

        return response.status(200).json(updatedProduct);
    }
    catch(err){
        console.log(`Error Updating Product`, err);
        return response.status(400);
    }

}

export const products_patchByID = async (request: Request<RequestParams, {},  RequestBody, {}>  ,response: Response): Promise<any> => {
    const { body, params: { id }} = request;

    try{
        const updatedProduct = await productModel.findByIdAndUpdate(
            { id },
            {
                name: body.name,
                description: body.description,
                price: body.price,
                image: body.image,
                category: body.category,
            },
            {
                new: true,       // Returns updated document
            }
        );
        console.log('Patching Product: /api/products/'+ id);

        return response.status(200).json(updatedProduct);
    }
    catch(err){
        console.log(`Error Patching Product`, err);
        return response.status(400);
    }
}





export const products_deleteByID = async (request: Request<RequestParams, {}, {}, {}> , response: Response): Promise<any> => {
    const { params: { id }} = request;

    
    try{
        const deletedProduct = await productModel.findByIdAndDelete({ _id: id});
        console.log('Deleting Product: /api/products/'+ id);

        return response.status(200).json(deletedProduct);
    }
    catch(err){
        console.log(`Error Deleting Product`, err);
        return response.status(400);
    }

}