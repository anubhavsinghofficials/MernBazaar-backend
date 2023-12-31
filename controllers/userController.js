

import Seller from '../models/sellerModel.js'
import User from '../models/userModel.js'
import Coupon from '../models/couponModel.js'
import bcrypt from 'bcryptjs'


//________________________________ USER CONTROLLERS

export const registerUser = async (req,res) => {

    const {name, email, password} = req.body

    if(!name || !email || !password){
       return res.status(400).json({error:"Kindly fill all the details"})
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
                
        if (process.env.NODE_ENV === 'production') {
            cookieOptions.sameSite = 'None'
            cookieOptions.secure = true
        }
        
        res.cookie("jwt",token, cookieOptions)
        res.status(201).json({message:'Account created successfully'})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const logInUser = async (req,res) => {

const {email, password} = req.body
if(!email || !password){
    return res.status(400).json({error:"Kindly fill all the details"})
}

try {
    const FoundUser = await User.findOne({email}).select("+password")
    if (!FoundUser) {
        return res.status(400).json({error:"User not found"})
    }

    const matched = await bcrypt.compare(password,FoundUser.password)
    if (!matched) {
        return res.status(401).json({error:"Invalid Credentials"})
    }

    const token = await FoundUser.genAuthToken(res)
    await FoundUser.save({ validateBeforeSave: false })

    const cookieOptions = {
                httpOnly: true,
                expires: new Date(
                    Date.now() + 10*24*60*60*1000
                )}

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.sameSite = 'None'
        cookieOptions.secure = true
    }
        
    const cartCount = FoundUser.cart.length
    res.cookie("jwt",token, cookieOptions)
    res.status(200).json({message:'Login successful',cartCount})
}
catch (error) {
    res.status(400).json({error:error.message})
}
}



export const logOutUser = async (req,res) => {
    try {
        res.clearCookie("jwt",{
            sameSite: 'None',
            secure: true
        })
        req.user.tokens = req.user.tokens.filter(ele => ele.token !== req.token)
        await req.user.save({ validateBeforeSave: false })

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
        req.user.tokens = []
        await req.user.save({ validateBeforeSave: false })
    
        res.status(200).json({message:"log out from all the devices successful"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getUserDetails = async (req,res) => {
    const user = {
        name:req.user.name,
        email:req.user.email,
        cartCount:req.user.cart.length
    }
    res.status(200).json({user})
}



export const updateUserDetails = async (req,res) => {
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



export const getShippingInfo = async (req,res) => {
    try {
        const aggregation = await User.aggregate([
            {
                $match:{_id:req.user._id}
            },
            {
                $project:{
                    shippingInfo: 1,
                    _id:0
                }
            },
        ])
        
        const shippingInfo = aggregation.length>0
                             ? aggregation[0].shippingInfo
                             : []
        res.status(200).json({shippingInfo})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getCart = async (req,res) => {
    try {
        const aggregation = await User.aggregate([
            {
                $match:{_id:req.user._id}
            },
            {
                $project:{
                    cart: 1,
                    _id:0
                }
            },
        ])
        
        const cart = aggregation.length>0
                    ? aggregation[0].cart
                    : []
        res.status(200).json({cart})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const deleteCartProduct = async (req,res) => {
    try {
        const productId = req.params.id
        if (!productId) {
            return res.status(400).json({error:'Kindly provide product id'})
        }
        req.user.cart = req.user.cart.filter((element) => {
            return element.product.toString() !== productId
        })
        
        await req.user.save({runValidators:false})
        res.status(200).json({message:'Item added to cart'})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const addToCart = async (req,res) => {
    try {
        const { stock, product, image, quantity, price, name } = req.body
        if (!stock || !product || !image || !quantity || !price || !name) {
            return res.status(400).json({error:'Insufficient product data, can not add to cart'})
        }
        const cartItemIndex = req.user.cart.findIndex((element) => {
            return element.product.toString() === product
        })

        if (cartItemIndex !== -1) {
            req.user.cart[cartItemIndex] = req.body;
        } else {
            req.user.cart.push(req.body);
        }

        await req.user.save({runValidators:false})
        res.status(200).json({message:'Item added to cart'})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const applyCouponCode = async (req,res) => {
    const { couponCode, amount } = req.body
    if (!couponCode || !amount) {
        return res.status(400).json({error:'Missing Coupon code or Amount'})
    }
    try {
        const foundCoupon = await Coupon.findOne({couponCode})
        if (!foundCoupon) {
            return res.status(400).json({error:'No coupon code found'})
        } else if (amount < foundCoupon.minAmount) {
            return res.status(400).json({error:`Coupon only applicable on orders above ₹ ${foundCoupon.minAmount}`})
        } else {
            res.status(200).json({message:'Coupon Code Applied', discount:foundCoupon.discount})
        }
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}


//_______________________________ SELLER CONTROLLERS

export const getActiveUsers = async (req,res) => {
    try {
        const {pageNo,pageLength} = req.query

        if (isNaN(pageNo) || isNaN(pageLength) || +pageNo<1 || +pageLength<1) {
            return res.status(400).json({error:"Invalid Page Length or Page Number"})
        }

        const userCount = await User.countDocuments()
        const users = await User.find()
                                .limit(pageLength)
                                .skip((+pageNo-1)*(+pageLength))

        res.status(200).json({userCount,users})
    }
    catch (error) {
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
// "Invalid Credentials" inside the login controller
// rather than telling which one is wrong b/w the
// email and the password ?