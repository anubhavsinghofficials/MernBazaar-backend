
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import Seller from '../models/sellerModel.js'



// User Authentication + Authorization
export const userAuth = async (req,res,next) => {

    const token = req.cookies.jwt
    if (!token) {
        return res.status(400).json({error:"authorization failed"})
    }

    try {
        const payload = await jwt.verify(token,process.env.JWT_KEY)
        const userFound = await User.findById(payload._id)

        if (!userFound) {
            return res.status(401).json({error:"authorization failed"})
        }

        req.token = token
        req.user = userFound
        // req.user.role = "seller"
        next()
    }
    catch (error) {
         res.status(401).json({error:error.message})
    }
}



// Seller Authentication + Authorization
export const sellerAuth = async (req,res,next) => {

    const token = req.cookies.jwt
    if (!token) {
        return res.status(400).json({error:"authorization failed"})
    }

    try {
        const payload = await jwt.verify(token,process.env.JWT_KEY)
        const sellerFound = await Seller.findById(payload._id)

        if (!sellerFound) {
            return res.status(401).json({error:"You have to be a seller to do this"})
        }

        req.token = token
        req.seller = sellerFound
        // req.user.role = "seller"
        next()
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