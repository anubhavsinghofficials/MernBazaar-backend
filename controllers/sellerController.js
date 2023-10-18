

import Seller from '../models/sellerModel.js'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'



//________________________________ USER CONTROLLERS

export const registerSeller = async (req,res) => {

    const {name, email, password, description, address} = req.body

    if(!name || !email || !password || !description || !address){
        return res.status(400).json({error:"Kindly fill all the details"})
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
        res.status(201).json({message:'Account created successfully'})
    }
    catch (error) {
        res.status(201).json({error:error.message})
    }
}



export const logInSeller = async (req,res) => {

    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({error:"Kindly fill all the details"})
    }

    try {
        const FoundSeller = await Seller.findOne({email}).select("+password")
        if (!FoundSeller) {
            return res.status(400).json({error:"Seller not found"})
        }
        else if (FoundSeller.blacklisted){
            const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
            return res.status(400).json({error})
        }

        const matched = await bcrypt.compare(password,FoundSeller.password)
        if (!matched) {
            return res.status(401).json({error:"Invalid Credentials"})
        }

        const token = await FoundSeller.genAuthToken(res)
        await FoundSeller.save({ validateBeforeSave: false })

        const cookieOptions = {
                    httpOnly: true,
                    expires: new Date(
                                Date.now() + 10*24*60*60*1000
                    )}
    
        res.cookie("jwt",token, cookieOptions)
        res.status(200).json({message:'Login successful'})   
    
    } catch (error) {
         res.status(400).json({error:error.message})
    }
}



export const logOutSeller = async (req,res) => {
    try {
        res.clearCookie("jwt")
        req.seller.tokens = req.seller.tokens.filter(ele => ele.token !== req.token)
        await req.seller.save({ validateBeforeSave: false })
    
        res.status(200).json({message:"logout successful"})
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
    
        res.status(200).json({message:"log out from all the devices successful"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
        console.log(error)
    }
}



export const getSellerDetails = async (req,res) => {
    if (req.seller.blacklisted){
        const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
        return res.status(400).json({error})
    }
    const seller = {
        name:req.seller.name,
        email:req.seller.email,
        address:req.seller.address,
        description:req.seller.description
    }
    res.status(200).json({seller})
    // or send only relevant data by either
    // extracting it from the req.user or
    // findById(req.user._id) 
}



export const updateSellerDetails = async (req,res) => {

    if (req.seller.blacklisted){
        const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
        return res.status(400).json({error})
    }

    const {name, email, description, address} = req.body
    
    let updates = {}
    updates = name ? {...updates,name} : {...updates,name:req.seller.name}
    updates = address ? {...updates,address} : {...updates,address:req.seller.address}
    updates = description ? {...updates,description} : {...updates,description:req.seller.description}

    try {
        if (email && email !== req.seller.email) {
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

        const updatedSeller = await Seller.findByIdAndUpdate(req.seller._id, updates, { new:true, runValidators:true })
        res.status(201).json(updatedSeller)
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

    const {currentPassword, newPassword} = req.body
    if (!currentPassword || !newPassword) {
        return res.status(400).json({error:"Kindly fill all the fields"})
    }

    const matched = await bcrypt.compare(currentPassword,req.seller.password)

    if (!matched) {
        return res.status(400).json({error:"Incorrect current password"})
    }
    else if(currentPassword === newPassword){
        return res.status(400).json({error:"Enter a different new password"})
    }

    try {
        req.seller.password = newPassword
        await req.seller.save()
        res.status(201).json({message:"Password successfully changed"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}