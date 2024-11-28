import express from 'express';
import { addToCart, getCarts, getCartById, updateCart, clearCart } from '../controllers/cartControllers';
import checkUserId from '../middleware/checkUserId';

const router = express.Router();


router.get('/api/carts', getCarts); // Get a all cart by user ID

router.get('/api/:userId/cart', checkUserId, getCartById); // Get a cart by user ID

router.post('/api/:userId/cart', checkUserId, addToCart); // Add items to the cart

router.put('/api/:userId/cart', checkUserId, updateCart); // Update the cart

router.delete('/api/:userId/cart', checkUserId, clearCart); // Clear the cart

export default router;