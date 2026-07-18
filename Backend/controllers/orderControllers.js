import orderModel from "../models/orderModel.js";
import userModel from "../models/userSchema.js";
import Stripe from "stripe"

// global variables
const currency = 'inr'
const deliveryCharge = 10

// gateway initilize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placeing orders on COD method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, address, amount } = req.body;
        console.log(userId);

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false, // Online Payment
            date: Date.now()
        }

        const newOrder = await new orderModel(orderData);
        newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartdata: {} });

        res.json({ success: true, message: "Order Placed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

// Placing order using stripe
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, amount, address, items } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false, // Online Payment
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges',
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: `payment`,
        })

        res.json({ success: true, session_url: session.url })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });

    }

}

// verify Stripe
const verifyStripe = async  (req, res)=>{

    const {orderId, success, userId} = req.body;
    try {
        if(success === true || success === "true" ){
            await orderModel.findByIdAndUpdate(orderId, {payment:true})
            await userModel.findByIdAndUpdate(userId, { cartData:{} })
            res.json({success: true})
        }else{
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message})
    }
}

// Placing orders using Razorpay
const placeOrderRazorpay = () => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: res.message });

    }
}

// All orders data on Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// User order Data Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// update order status for Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { status, orderId } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

export { placeOrder, placeOrderRazorpay, placeOrderStripe, updateStatus, allOrders, userOrders, verifyStripe }