
import mongoose from "mongoose";



const couponSchema = new mongoose.Schema({
    couponCode:{
        type:String,
        trim:true,
        required:true,
        maxLength:[13,"Name can't exceed 13 characters"],
        minLength:[4,"Name must atleast be of 4 characters"],
    },
    minAmount:{
        type: Number,
        default:0,
        required:true
    },
    discount:{
        type: Number,
        default:0,
        required:true,
        validate: {
            validator: value => value < 100,
            message: "Discount must be less than 100",
        }
    },
    seller:{
        type:mongoose.Schema.ObjectId,
        ref:"seller",
        required:[true,"Seller Id is missing"],
    },
})



const Coupon = mongoose.model('coupon',couponSchema)
export default Coupon