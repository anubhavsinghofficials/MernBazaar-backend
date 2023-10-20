

import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'



// Schema Creation ________________________________________

const userSchema = new mongoose.Schema({

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

    shippingInfo:[
        {
            address:{
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            },
            state:{
                type:String,
                required:true
            },
            country:{
                type:String,
                required:true
            },
            pinCode:{
                type:Number,
                required:true
            },
            phoneNo:{
                type:String,
                required:true
            }
        },
    ],

    password:{
        type:String,
        required: [true,"Password is required"],
        trim:true,
        maxLength:[12,"Password can't exceed 12 characters"],
        minLength:[6,"Password must atleast be of 6 characters"],
        select:false
    },

    joinedAt:{
        type:Date,
        default:Date.now
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

userSchema.pre("save",async function (next){
    if (this.isModified("password")) {
       this.password = await bcrypt.hash(this.password,10)
    }
    next()
})

userSchema.methods.genAuthToken = async function (res) {
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

const User = mongoose.model("user",userSchema)
export default User