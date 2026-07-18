import express from 'express'
import { addToCart, updateCart, getUserCart } from '../controllers/cartControllers.js'
import authUser from '../middleware/Auth.js';

const CartRouter = express.Router();

CartRouter.post('/get', authUser, getUserCart)
CartRouter.post('/add', authUser, addToCart)
CartRouter.post('/update', authUser, updateCart)

export default CartRouter


