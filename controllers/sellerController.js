

import Seller from '../models/sellerModel.js'
import User from '../models/userModel.js'
import Coupon from '../models/couponModel.js'
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

        if (process.env.NODE_ENV === 'production') {
            cookieOptions.sameSite = 'None'
            cookieOptions.secure = true
        }
        
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
                    
        if (process.env.NODE_ENV === 'production') {
            cookieOptions.sameSite = 'None'
            cookieOptions.secure = true
        }
            
        res.cookie("jwt",token, cookieOptions)
        res.status(200).json({message:'Login successful'})   
    
    } catch (error) {
         res.status(400).json({error:error.message})
    }
}



export const logOutSeller = async (req,res) => {
    try {
        res.clearCookie("jwt",{
            sameSite: 'None',
            secure: true
        })
        req.seller.tokens = req.seller.tokens.filter(ele => ele.token !== req.token)
        await req.seller.save({ validateBeforeSave: false })
    
        res.status(200).json({message:"logout successful"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const logOutFromAllDevices = async (req,res) => {
    try {
        res.clearCookie("jwt",{
            sameSite: 'None',
            secure: true
        })
        req.seller.tokens = []
        await req.seller.save({ validateBeforeSave: false })
    
        res.status(200).json({message:"log out from all the devices successful"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getSellerDetails = async (req,res) => {
    
    const seller = {
        name:req.seller.name,
        email:req.seller.email,
        address:req.seller.address,
        description:req.seller.description
    }
    res.status(200).json({seller})
}



export const updateSellerDetails = async (req,res) => {

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



export const getCoupons = async (_req,res) => {
    try {
        const coupons = await Coupon.find()
        res.status(201).json({coupons})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const createNewCoupon = async (req,res) => {
    const {couponCode, minAmount, discount} = req.body
    if (!couponCode || (minAmount && isNaN(minAmount)) || (discount && isNaN(discount))) {
        return res.status(400).json({error:"Kindly fill all the fields"})
    }

    const foundCoupon = await Coupon.find({couponCode})
    if (foundCoupon.length > 0) {
        return res.status(400).json({error:'Coupon already exists'})
    }
    try {
        await Coupon.create({
            couponCode,
            minAmount,
            discount,
            seller:req.seller._id
        })
        res.status(201).json({message:"Coupon Code Generated"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const deleteCoupon = async (req,res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id)
        res.status(201).json({message:"Coupon deleted"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}