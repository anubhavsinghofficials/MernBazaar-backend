
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import Seller from '../models/sellerModel.js'




// User Authentication + Authorization
export const userAuth = async (req,res,next) => {

    const token = req.cookies.jwt
    if (!token) {
        return res.status(400).json({error:"Authorization failed, Login to your user account"})
    }

    try {
        const payload = await jwt.verify(token,process.env.JWT_KEY)
        const userFound = await User.findById(payload._id).select("+password")

        if (!userFound) {
            return res.status(401).json({error:"login with your user account to do this"})
        }

        req.token = token
        req.user = userFound
        next()
    }
    catch (error) {
         res.status(401).json({error:error.message})
    }
}




export const sellerAuth = async (req,res,next) => {

    const token = req.cookies.jwt
    if (!token) {
        return res.status(400).json({error:"Authorization failed, Login to your seller account"})
    }

    try {
        const payload = await jwt.verify(token,process.env.JWT_KEY)
        const sellerFound = await Seller.findById(payload._id).select("+password")

        if (!sellerFound) {
            return res.status(401).json({error:"You have to be a seller to do this"})
        }

        req.token = token
        req.seller = sellerFound
        next()
    }
    catch (error) {
         res.status(401).json({error:error.message})
    }
}




// this will help in getting user's review
export const tempUserAuth = async (req,res,next) => {
    const token = req.cookies.jwt
    if (token) {
        try {
            const payload = await jwt.verify(token,process.env.JWT_KEY)
            const userFound = await User.findById(payload._id).select("+password")
            if (userFound) {
                req.user = userFound
            }
        }
        catch (error) {
            res.status(401).json({error:error.message})
        }
    }
    next()
}




export const authRole = async (req,res) => {

    const token = req.cookies.jwt
    if (!token) {
        return res.status(200).json({role:'public'})
    }

    try {
        const payload = await jwt.verify(token,process.env.JWT_KEY)
        const userFound = await User.findById(payload._id)
        if (userFound) {
            return res.status(200).json({role:'user',cartCount:userFound.cart.length})
        }
        
        const sellerFound = await Seller.findById(payload._id)
        if (sellerFound) {
            return res.status(200).json({role:'seller'})
        }
        
        return res.status(200).json({role:'public'})
    }
    catch (error) {
         res.status(401).json({error:error.message})
    }
}

















// export const sellerAuthorize = async (req,res,next) => {
//     if (req.user.role !== "seller") {
//         return res.status(403).json({error:"You have to be a seller to do this"})
//     }
//     next()
// }


// remember!! The next() function doesn't skip the remaining
// lines of code in the current function, but it rather signals
// to move to the next middleware or route handler in the chain.

