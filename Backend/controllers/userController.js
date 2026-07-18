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

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, msg: "User doesn't exists!" })
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

        const { name, email, password } = req.body

        // Checking if user already exists!
        const exists = await userModel.findOne({ email })

        if (exists) {
            return res.json({ success: false, msg: "User already exists!" })
        }

        // Validating email format and Strong Password  
        if (!validator.isEmail(email)) {
            return res.json({ success: false, msg: "Enter valid Email!" })
        }

        if (password.length < 8) {
            return res.json({ success: false, msg: "Enter Strong Password!" })
        }

        // hashing user password!
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)


        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({ success: true, token })
    }
    catch (e) {
        console.log(e)
        res.json({ success: false, msg: e.messages })
    }
}

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