import { log } from 'console';
import mongoose from 'mongoose' 

const connectDB = async ()=>{

    await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)
    log("database is connnected");
}

export default connectDB;