

import Seller from '../models/sellerModel.js'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'



//________________________________ USER CONTROLLERS

export const registerUser = async (req,res) => {

    const {name, email, password} = req.body

    if(!name || !email || !password){
       return res.status(400).json({error:"please fill all the details"})
    }

    try {
        const UserFound = await User.findOne({email})

        if (UserFound) {
            return res.status(400).json({error:"Email already exists"})
        }
        else {
            const SellerFound = await Seller.findOne({email})
            if (SellerFound) {
                return res.status(400).json({error:"Email already exists"})
            }
        }

        const user = new User({
            name,
            email,
            password
        })
        
        const token = await user.genAuthToken(res)
        await user.save()

        const cookieOptions = {
                httpOnly: true,
                expires: new Date(
                    Date.now() + 10*24*60*60*1000
                )}
        res.cookie("jwt",token, cookieOptions)
        res.status(201).json({message:'Account created successfully!!'})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const logInUser = async (req,res) => {

    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({error:"please fill all the details"})
    }

    try {
        const FoundUser = await User.findOne({email}).select("+password")
        if (!FoundUser) {
            return res.status(400).json({error:"User not found!!"})
        }
        else if (FoundUser.blacklisted){
            const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
            return res.status(400).json({error})
        }

        const matched = await bcrypt.compare(password,FoundUser.password)
        if (!matched) {
            return res.status(401).json({error:"invalid Credentials"})
        }

        const token = await FoundUser.genAuthToken(res)
        await FoundUser.save({ validateBeforeSave: false })

        const cookieOptions = {
                    httpOnly: true,
                    expires: new Date(
                        Date.now() + 10*24*60*60*1000
                    )} // see bottom comments
                            
        res.cookie("jwt",token, cookieOptions)
        res.status(200).json({message:'Login successfull!!'})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const logOutUser = async (req,res) => {
    try {
        res.clearCookie("jwt")
        req.user.tokens = req.user.tokens.filter(ele => ele.token !== req.token)
        await req.user.save({ validateBeforeSave: false })

        res.status(200).json({message:"logout successfull!!"})
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
        await req.user.save({ validateBeforeSave: false })
    
        res.status(200).json({message:"logged out from all the devices successfull!!"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getUserDetails = async (req,res) => {
    if (req.user.blacklisted){
        const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
        return res.status(400).json({error})
    }
    const user = {
        name:req.user.name,
        email:req.user.email
    }
    res.status(200).json({user})
    // or send only relevant data by either
    // extracting it from the req.user or
    // findById(req.user._id) 
}



export const updateUserDetails = async (req,res) => {

    if (req.user.blacklisted){
        const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
        return res.status(400).json({error})
    }

    const {name, email} = req.body

    let updates = {}
    updates = name ? {...updates,name} : {...updates,name:req.user.name}
    
    try {
        if (email && email !== req.user.email) {
            const UserFound = await User.findOne({email})
            if (UserFound) {
                return res.status(400).json({error:"Email already exists"})
            }
            else {
                const SellerFound = await Seller.findOne({email})
                if (SellerFound) {
                    return res.status(400).json({error:"Email already exists"})
                }
                else{
                    updates = {...updates,email}
                }
            }
        }

        const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new:true, runValidators:true })
        res.status(201).json(updatedUser)
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const updateUserPassword = async (req,res) => {

    if (req.user.blacklisted){
        const error = "Your account has been blocked by MernBazaar, Contact mernbazaar@gmail.com for more info"
        return res.status(400).json({error})
    }

    const {currentPassword, newPassword} = req.body
    if (!currentPassword || !newPassword) {
        return res.status(400).json({error:"Kindly fill all the fields"})
    }

    const matched = await bcrypt.compare(currentPassword,req.user.password)

    if (!matched) {
        return res.status(400).json({error:"Incorrect current password"})
    }
    else if(currentPassword === newPassword){
        return res.status(400).json({error:"Enter a different new password"})
    }

    try {
        req.user.password = newPassword
        await req.user.save()
        res.status(201).json({message:"Password successfully changed"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}




//_______________________________ SELLER CONTROLLERS

export const getActiveUsers = async (req,res) => {
    try {
        const {pageNo,pageLength} = req.query

        if (isNaN(pageNo) || isNaN(pageLength) || +pageNo<1 || +pageLength<1) {
            res.status(400).json({error:"Invalid Page Length or Page Number"})
        }

        const userCount = await User.countDocuments({blacklisted:false})
        const users = await User.find({blacklisted:false})
                                .limit(pageLength)
                                .skip((+pageNo-1)*(+pageLength))

        res.status(200).json({userCount,users})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}

export const getUserData = async (req,res) => {
    try {
        const FoundUser = await User.findById(req.params.id)
        res.status(200).json({user:FoundUser})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}









//  expires: Date.now() + 5*24*60*60*1000
//  expires: new Date(
//              Date.now() + 5*24*60*60*1000
//          )


// req.user = {...req.user,name,email,avatar}
// req.user.save()  won't work on the above one,
//-----------------------------------------------------------
// but will work on the below ones because here we r not
// converting the mongoose instance object to a normal object
//-----------------------------------------------------------
// req.user.name = name ? name : req.user.name
// req.user.email = email ? email : req.user.email
// req.user.avatar = avatar ? avatar : req.user.avatar



// in the register user function you have sended
// response as "email already exists", don't you
// think that that can reverse your security
// measure that you took when you set the response
// "invalid credentials" inside the login controller
// rather than telling which one is wrong b/w the
// email and the password ?