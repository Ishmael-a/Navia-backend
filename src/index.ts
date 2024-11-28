import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import allRoutes from './routes/Router'
import cors from "cors";

const PORT = process.env.PORT || 4000;

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Allow only your frontend
    credentials: true, // Allow cookies to be sent with requests
}));

app.use(allRoutes);

mongoose.connect("mongodb://localhost:27017/navia-ecommerce")
.then(() => {console.log("Connected To Database Successfully")})
.catch(err => console.log('Error Connecting To Database: ', err))


app.listen(PORT, () => {
    console.log(`Running On Port: ${PORT}`);
});
