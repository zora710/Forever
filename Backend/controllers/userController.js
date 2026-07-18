import bcrypt from "bcrypt"
import validator from "validator"
import jwt from "jsonwebtoken"
import userModel from "../models/userSchema.js"

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Rooute for user Login
const loginUser = async (req, res) => {
    try {
        
        const { email, password } = req.body
        // console.log("aaya hun mai");

        const user = await userModel.findOne({ email })
        console.log(user);
        
        if (!user) {
            console.log("if blovk");
            
            return res.json({ success: false, message: "User doesn't exists!" })
        }

        // Checking if the password of user matches!
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = createToken(user._id)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Credentials" })
        }

    } catch (e) {
        console.log(e);
        res.json({ success: false, message: "Invalid Credentials" })
    }
}

// Route for user Register 
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                msg: "All fields are required!"
            });
        }

        // Check if user already exists
        const exists = await userModel.findOne({ email });

        if (exists) {
            return res.status(409).json({
                success: false,
                msg: "User already exists!"
            });
        }

        // Validate email
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                msg: "Enter a valid email!"
            });
        }

        // Validate password
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                msg: "Password must be at least 8 characters long!"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate token
        const token = createToken(user._id);

        return res.status(201).json({
            success: true,
            msg: "User registered successfully!",
            token
        });

    } catch (e) {
        console.error("Register Error:", e);

        return res.status(500).json({
            success: false,
            msg: e.message
        });
    }
};
// Route for admin Login
const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body
    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD ){
        let token = jwt.sign(email+password, process.env.JWT_SECRET)
        res.json({success:true, token})
    }else{
        res.json({success:false, message:"Invalid Credentials"})
    }
    } catch (e) {
        console.log(e)
        res.json({ success: false, msg: e.messages })
    }
}

export { loginUser, registerUser, adminLogin }