

import Seller from '../models/sellerModel.js'
import bcrypt from 'bcryptjs'



export const registerSeller = async (req,res) => {

    const {name, email, password, description} = req.body

    if(!name || !email || !password || !description){
       return res.status(400).json({error:"please fill all the details"})
    }

    const SellerFound = await Seller.findOne({email})
    if (SellerFound) {
        return res.status(400).json({error:"Email already exists"})
    }

    const seller = new Seller({
        name,
        email,
        password,
        description,
        avatar:{
            public_id:"sample_id",
            url:"laskdfalskdjfa;sldfjalsdkfj"
        }
    })
    
    try {
        await seller.save()

        const token = await seller.genAuthToken(res)
        const cookieOptions = {
                                httpOnly: true,
                                expires: new Date(
                                            Date.now() + 10*24*60*60*1000
                                        )} // see bottom comments
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
     
    const FoundSeller = await Seller.findOne({email}).select("+password")
    if (!FoundSeller) {
         return res.status(400).json({error:"Seller not found!!"})
    }

    const matched = await bcrypt.compare(password,FoundSeller.password)
    if (!matched) {
         return res.status(401).json({error:"invalid Credentials"})
    }

    const token = await FoundSeller.genAuthToken(res)
    const cookieOptions = {
                httpOnly: true,
                expires: new Date(
                            Date.now() + 10*24*60*60*1000
                        )} // see bottom comments

    res.cookie("jwt",token, cookieOptions)
    res.status(200).json({token,FoundSeller})
}



export const logOutSeller = async (req,res) => {
    try {
        res.clearCookie("jwt")

        req.seller.tokens = req.seller.tokens.filter(ele => ele.token !== req.token)
        await req.seller.save()
    
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
        await req.seller.save()
    
        res.status(200).json({message:"logged out from all the devices!!"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
        console.log(error)
    }
}