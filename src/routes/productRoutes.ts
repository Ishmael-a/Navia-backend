import express, {Router} from 'express';
import multer from 'multer';
import path from "path";
import fs from "fs";
import { products_get, products_getByID, products_deleteByID, products_post } from "../controllers/productControllers";

const router = Router();

// Define the upload directory path based on the project root
const uploadDir = path.resolve(__dirname, '../uploadedImages');

// Check if the directory exists; if not, create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDir)
    },
    filename: (req, file, callback) => {
        console.log(file);
        const sanitizedFilename = file.originalname.replace(/\s+/g, '_');
        callback(null, Date.now() + '-' + sanitizedFilename);
    },
})

const upload = multer({ storage: storage });

router.use('/images', express.static(path.join(__dirname, '../uploadedImages')));


router.get("/api/products", products_get);

router.post("/api/products", upload.single("image"), products_post);

router.get("/api/products/:id", products_getByID);

router.delete("/api/products/:id", products_deleteByID);



export default router;