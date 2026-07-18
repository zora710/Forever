import express from 'express'
import cors from "cors"
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import CartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import aiRouter from './routes/aiRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import morgan from 'morgan';
import dns from "dns"
dns.setServers(["1.1.1.1", "8.8.8.8"])
// App config
const app = express();
const port = process.env.PORT || 4000

connectDB()
connectCloudinary()

// Middlewares
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))

// api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', CartRouter)
app.use('/api/order', orderRouter)
app.use('/api/ai', aiRouter)
app.use('/api/review', reviewRouter)

// Api endpoints
app.get('/', (req,res)=>{
    res.send("Api working!")
})


app.listen(port, ()=>{
    console.log("Server is running on port:"+ port);
    
})
