import express from 'express';
import { addOrder, getOrders, getOrderById, updateOrder, deleteOrder} from '../controllers/orderControllers';
import checkUserId from '../middleware/checkUserId';

const router = express.Router();


router.get('/api/orders', getOrders); // Get all orders 

router.get('/api/:userId/order', checkUserId, getOrderById); // Get a order by user ID

router.post('/api/:userId/order', checkUserId, addOrder); // Add items to the cart

router.put('/api/:userId/order', checkUserId, updateOrder); // Update the cart

router.delete('/api/:userId/order', checkUserId, deleteOrder); // Clear the cart

export default router;