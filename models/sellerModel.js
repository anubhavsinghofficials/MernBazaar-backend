

import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'



// Schema Creation ________________________________________

const sellerSchema = new mongoose.Schema({

    name:{
        type:String,
        required: [true,"Name is required"],
        trim:true,
        maxLength:[20,"Name can't exceed 20 characters"],
        minLength:[3,"Name must atleast be of 3 characters"],
    },

    email:{
        type:String,
        required: [true,"Email is required"],
        validate:[validator.isEmail, "Enter a valid Email"],
        unique:true,
        trim:true,
    },

    password:{
        type:String,
        required: [true,"Password is required"],
        trim:true,
        maxLength:[12,"Password can't exceed 12 characters"],
        minLength:[6,"Password must atleast be of 6 characters"],
        select:false
    },

    description:{
        type:String,
        required:[true,"Seller description is required"],
        trim:true,
    },

    address:{
        type:String,
        required:[true,"Seller address is required"],
        trim:true,
    },

    joinedAt:{
        type:Date,
        default:Date.now
    },

    sellerScore:{
        type:Number,
        default:0,
        required:true
    },

    blacklisted:{
        type:Boolean,
        default:false,
        required:true
    },

    resetPasswordToken:String,
    resetPasswordExpire:Date,

    tokens:[
        {
            token:{
                type:String,
                required:[true,"token can't be empty"]
            }
        }
    ]
})




// Schema Methods _________________________________________

sellerSchema.pre("save",async function (next){
    if (this.isModified("password")) {
       this.password = await bcrypt.hash(this.password,10)
    }
    next()
})

sellerSchema.methods.genAuthToken = async function (res) {
    try {
        const token = await jwt.sign({_id:this._id},process.env.JWT_KEY,{expiresIn:"10d"})
        this.tokens = [...this.tokens,{token}]
        return token
    }
    catch (error) {
         res.status(400).json({error:error.message})
    }
}



// Model Export __________________________________________

const Seller = mongoose.model("seller",sellerSchema)
export default Seller