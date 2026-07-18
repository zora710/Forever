import userModel from "../models/userSchema.js";

//  add products to user cart
const addToCart = async (req, res) => {
    const { itemId, size, userId } = req.body;
    console.log(itemId, size, userId);
    
    try {
        const userData = await userModel.findById(userId);
        const cartData = await userData.cartData;
        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}


// update user cart
const updateCart = async (req, res) => {

    const { id, userId, size, quantity } = req.body;

    try {
        const userData = await userModel.findById(userId);
        const cartData = userData.cartData;

        cartData[id][size] = quantity;

        await userModel.findByIdAndUpdate(userId, {cartData})
        console.log("CartUpdated");
        
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}


//  get user cart
const getUserCart = async (req, res) => {
   try {
    const {userId} = req.body;
   const userData = await userModel.findById(userId);
   const cartData = await userData.cartData;

   res.json({success:true, cartData });
   } catch (error) {
    console.log(error);
    res.json({success:false, message:error.message})
   }
}


export { addToCart, updateCart, getUserCart }