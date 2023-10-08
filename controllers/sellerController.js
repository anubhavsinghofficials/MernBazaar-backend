

import Seller from '../models/sellerModel.js'
import User from '../models/userModel.js'
import Product from '../models/productModel.js'
import bcrypt from 'bcryptjs'



//________________________________ USER CONTROLLERS

export const registerSeller = async (req,res) => {

    const {name, email, password, description, address} = req.body

    if(!name || !email || !password || !description || !address){
        return res.status(400).json({error:"please fill all the details"})
    }

    try {
        const SellerFound = await Seller.findOne({email})

        if (SellerFound) {
            return res.status(400).json({error:"Email already exists"})
        }
        else {
            const UserFound = await User.findOne({email})
            if (UserFound) {
                return res.status(400).json({error:"Email already exists"})
            }
        }

        const seller = new Seller({
            name,
            email,
            password,
            description,
            address
        })
    
        const token = await seller.genAuthToken(res)
        await seller.save()

        const cookieOptions = {
                httpOnly: true,
                expires: new Date(
                    Date.now() + 10*24*60*60*1000
                )}
        res.cookie("jwt",token, cookieOptions)
        res.status(201).json({token,seller})
    }
    catch (error) {
        res.status(201).json({error:error.message})
    }
}



export const logInSeller = async (req,res) => {

    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({error:"please fill all the details"})
     }
    try {
        const FoundSeller = await Seller.findOne({email}).select("+password")
    
        if (!FoundSeller) {
            return res.status(400).json({error:"Seller not found!!"})
        } else if (FoundSeller.blacklisted){
            const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
            return res.status(400).json({error})
        }

        const matched = await bcrypt.compare(password,FoundSeller.password)
        if (!matched) {
            return res.status(401).json({error:"invalid Credentials"})
        }

        const token = await FoundSeller.genAuthToken(res)
        await FoundSeller.save({ validateBeforeSave: false })

        const cookieOptions = {
                    httpOnly: true,
                    expires: new Date(
                                Date.now() + 10*24*60*60*1000
                    )} // see bottom comments
    
        res.cookie("jwt",token, cookieOptions)
        res.status(200).json({token,FoundSeller})   
    
    } catch (error) {
         res.status(400).json({error:error.message})
    }
}



export const logOutSeller = async (req,res) => {
    try {
        res.clearCookie("jwt")

        req.seller.tokens = req.seller.tokens.filter(ele => ele.token !== req.token)
        await req.seller.save({ validateBeforeSave: false })
    
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

        req.seller.tokens = []
        await req.seller.save({ validateBeforeSave: false })
    
        res.status(200).json({message:"logged out from all the devices!!"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
        console.log(error)
    }
}



export const deleteSellerAccount = async (req,res) => {
    try {        
        if (req.seller.blacklisted){
            const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
            return res.status(400).json({error})
        }

        const deletedProducts = await Product.deleteMany({seller:req.seller._id });
        const deletedSeller = await Seller.findByIdAndDelete(req.seller._id)
        res.status(200).json({deletedSeller,deletedProducts})
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getSellerDetails = async (req,res) => {
    if (req.seller.blacklisted){
        const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
        return res.status(400).json({error})
    }
    res.status(200).json(req.seller)
    // or send only relevant data !!
}



export const updateSellerDetails = async (req,res) => {

    if (req.seller.blacklisted){
        const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
        return res.status(400).json({error})
    }

    const {name, email, description, avatar} = req.body
    
    let updates = {}
    updates = name ? {...updates,name} : {...updates,name:req.seller.name}
    updates = avatar ? {...updates,avatar} : {...updates,avatar:req.seller.avatar}
    updates = description ? {...updates,description} : {...updates,description:req.seller.description}

    try {
        if (email) {
            const SellerFound = await Seller.findOne({email})
            if (SellerFound) {
                return res.status(400).json({error:"Email already exists"})
            }
            else {
                const UserFound = await User.findOne({email})
                if (UserFound) {
                    return res.status(400).json({error:"Email already exists"})
                }
                else{
                    updates = {...updates,email}
                }
            }
        }

        const updatedUser = await Seller.findByIdAndUpdate(req.seller._id, updates, { new:true, runValidators:true })
        res.status(201).json(updatedUser)
    }
    catch (error) {
        res.status(201).json({error:error.message})
    }
}



export const updateSellerPassword = async (req,res) => {

    if (req.seller.blacklisted){
        const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
        return res.status(400).json({error})
    }

    const {oldPassword, newPassword} = req.body
    if (!oldPassword || !newPassword) {
        return res.status(400).json({error:"Kindly fill all the fields"})
    }

    const matched = await bcrypt.compare(oldPassword,req.seller.password)

    if (!matched) {
        return res.status(400).json({error:"the old password didn't matched"})
    }
    else if(oldPassword === newPassword){
        return res.status(400).json({error:"Enter a different new password"})
    }

    try {
        req.seller.password = newPassword
        await req.seller.save()
        res.status(201).json(req.seller)
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}