

import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'



export const registerUser = async (req,res) => {

    const {name, email, password} = req.body

    if(!name || !email || !password){
       return res.status(400).json({error:"please fill all the details"})
    }

    const UserFound = await User.findOne({email})
    if (UserFound) {
        return res.status(400).json({error:"Email already exists"})
    }

    const user = new User({
        name,
        email,
        password,
        avatar:{
            public_id:"sample_id",
            url:"laskdfalskdjfa;sldfjalsdkfj"
        }
    })
    
    try {
        await user.save()

        const token = await user.genAuthToken(res)
        const cookieOptions = {
                                httpOnly: true,
                                expires: new Date(
                                            Date.now() + 10*24*60*60*1000
                                        )} // see bottom comments
        res.cookie("jwt",token, cookieOptions)
        res.status(201).json({token,user})
    }
    catch (error) {
        res.status(201).json({error:error.message})
    }
}



export const logInUser = async (req,res) => {

    const {email, password} = req.body

    if(!email || !password){
        return res.status(400).json({error:"please fill all the details"})
     }
     
    const FoundUser = await User.findOne({email}).select("+password")
    if (!FoundUser) {
         return res.status(400).json({error:"User not found!!"})
    }

    const matched = await bcrypt.compare(password,FoundUser.password)
    if (!matched) {
         return res.status(401).json({error:"invalid Credentials"})
    }

    const token = await FoundUser.genAuthToken(res)
    const cookieOptions = {
                httpOnly: true,
                expires: new Date(
                            Date.now() + 10*24*60*60*1000
                        )} // see bottom comments

    res.cookie("jwt",token, cookieOptions)
    res.status(200).json({token,FoundUser})
}



export const logOutUser = async (req,res) => {
    try {
        res.clearCookie("jwt")

        req.user.tokens = req.user.tokens.filter(ele => ele.token !== req.token)
        await req.user.save()
    
        res.status(200).json({message:"logout successful!!"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
        console.log(error)
    }
}



export const logOutFromAllDevices = async (req,res) => {
    try {
        res.clearCookie("jwt")

        req.user.tokens = []
        await req.user.save()
    
        res.status(200).json({message:"logged out from all the devices!!"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
        console.log(error)
    }
}


// authenticate user only function???





//  expires: Date.now() + 5*24*60*60*1000
//  expires: new Date(
//              Date.now() + 5*24*60*60*1000
//          )