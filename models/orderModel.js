

import mongoose from 'mongoose'


const orderSchema = new mongoose.Schema({

    shippingInfo:{
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

    orderItems:[
        {
            name:{
                type:String,
                required:true
            },     
            price:{
                type:Number,
                required:true
            },
            quantity:{
                type:Number,
                required:true
            }, 
            image:{
                type:String,
                required:true
            },
            product:{
                type:mongoose.Schema.ObjectId,
                ref:"product",
                required:true
            },
        }
    ],

    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true
    },

    paymentInfo:{
        id:{
            type:String,
            required:true
        },
        status:{
            type:String,
            required:true
        },
    },

    paidAt:{
        type:Date,
        required:true,
    },

    totalPrice:{
        type:Number,
        required:true,
    },

    orderStatus:{
       type:String,
       enum:["delivered", "shipped","pending"],
       default:"pending",
       required:true
    },

    deliveredAt:Date,

    createdAt:{
       type:Date,
       default:Date.now,
       required:true,
    },
})



const Order = mongoose.model("order",orderSchema)
export default Order