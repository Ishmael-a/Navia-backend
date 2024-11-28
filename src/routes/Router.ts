import express,{ Router } from "express";
import cookieParser from 'cookie-parser';
import userRouter from './authRoutes';
import productRouter from './productRoutes';
import cartRouter from './cartRoutes';
import orderRouter from './orderRoutes';


const router = Router();

router.use(express.json());
router.use(cookieParser());


router.use(userRouter);
router.use(productRouter);
router.use(cartRouter);
router.use(orderRouter);


export default router;



