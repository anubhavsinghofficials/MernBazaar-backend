

import Seller from '../models/sellerModel.js'
import User from '../models/userModel.js'
import Admin from '../models/adminModel.js'
import bcrypt from 'bcryptjs'




export const registerAdmin = async (req,res) => {

    const {name, email, password} = req.body

    if(!name || !email || !password){
       return res.status(400).json({error:"please fill all the details"})
    }

    const AdminFound = await Admin.findOne({email})

    if (AdminFound) {
        return res.status(400).json({error:"Email already exists"})
    }
    else {
        const SellerFound = await Seller.findOne({email})
        if (SellerFound) {
            return res.status(400).json({error:"Email already exists"})
        }
        else{
            const UserFound = await User.findOne({email})
            if (UserFound) {
                return res.status(400).json({error:"Email already exists"})
            }
        }
    }

    const admin = new Admin({
        name,
        email,
        password,
        avatar:{
            public_id:"sample_id",
            url:"laskdfalskdjfa;sldfjalsdkfj"
        }
    })
    
    try {
        const token = await admin.genAuthToken(res)
        await admin.save()

        const cookieOptions = {
                httpOnly: true,
                expires: new Date(
                    Date.now() + 10*24*60*60*1000
                )}
        res.cookie("jwt",token, cookieOptions)
        res.status(201).json({token,admin})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const logInAdmin = async (req,res) => {

    const {email, password} = req.body

    if(!email || !password){
        return res.status(400).json({error:"please fill all the details"})
     }
     
    const FoundAdmin = await Admin.findOne({email}).select("+password")
    if (!FoundAdmin) {
         return res.status(400).json({error:"Admin not found!!"})
    }

    const matched = await bcrypt.compare(password,FoundAdmin.password)
    if (!matched) {
         return res.status(401).json({error:"invalid Credentials"})
    }

    try {
        const token = await FoundAdmin.genAuthToken(res)
        await FoundAdmin.save({ validateBeforeSave: false })

        const cookieOptions = {
                    httpOnly: true,
                    expires: new Date(
                        Date.now() + 10*24*60*60*1000
                    )}
                            
        res.cookie("jwt",token, cookieOptions)
        res.status(200).json({token,FoundAdmin})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const logOutAdmin = async (req,res) => {
    try {
        res.clearCookie("jwt")

        req.admin.tokens = req.admin.tokens.filter(ele => ele.token !== req.token)
        await req.admin.save({ validateBeforeSave: false })

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

        req.admin.tokens = []
        await req.admin.save({ validateBeforeSave: false })
    
        res.status(200).json({message:"logged out from all the devices!!"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const deleteAdminAccount = async (req,res) => {
    try {

        const adminCount = await Admin.countDocuments()
        if (adminCount === 1) {
            return res.status(400).json({
                error: "Deletion not allowed as this is the only admin account left.",
            });
        }

        const deletedAdmin = await Admin.findByIdAndDelete(req.admin._id)
        if (!deletedAdmin) {
           return res.status(400).json({error:"Admin doesn't exist already"})
        }

        res.status(200).json(deletedAdmin)
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getAdminDetails = async (req,res) => {
    res.status(200).json(req.admin)
}



export const updateAdminDetails = async (req,res) => {

    const {name, email, avatar} = req.body

    try {
        let updates = {}
        updates = name ? {...updates,name} : {...updates,name:req.admin.name}
        updates = avatar ? {...updates,avatar} : {...updates,avatar:req.admin.avatar}
        
        if (email) {
            const AdminFound = await Admin.findOne({email})
            if (AdminFound) {
                return res.status(400).json({error:"Email already exists"})
            }
            else {
                const UserFound = await User.findOne({email})
                if (UserFound) {
                    return res.status(400).json({error:"Email already exists"})
                }
                else{
                    const SellerFound = await Seller.findOne({email})
                    if (SellerFound) {
                        return res.status(400).json({error:"Email already exists"})
                    }else{
                        updates = {...updates,email}
                    }
                }
            }
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(req.admin._id, updates, { new:true, runValidators:true })
        res.status(201).json(updatedAdmin)
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const updateAdminPassword = async (req,res) => {

    const {oldPassword, newPassword} = req.body

    if (!oldPassword || !newPassword) {
        return res.status(400).json({error:"Kindly fill all the fields"})
    }

    const matched = await bcrypt.compare(oldPassword,req.admin.password)

    if (!matched) {
        return res.status(400).json({error:"the old password didn't matched"})
    }
    else if(oldPassword === newPassword){
        return res.status(400).json({error:"Enter a different new password"})
    }

    try {
        req.admin.password = newPassword
        await req.admin.save()
        res.status(201).json(req.admin)
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getAllAdmins = async (_req,res) => {
    try {
        const admins = await Admin.find()
        res.status(200).json(admins)
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}