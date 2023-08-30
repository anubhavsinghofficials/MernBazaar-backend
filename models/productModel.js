


import mongoose from 'mongoose'



// Schema Creation ________________________________________
const productSchema = new mongoose.Schema({

    title:{
        type:String,
        required:[true,"Product Title is required"],
        trim:true,
    },
    
    description:{
        type:String,
        required:[true,"Product description is required"],
        trim:true,
    },

    category:{
        type:String,
        required:[true,"Product category is required"],
        trim:true,
    },

    autoTags:{
        type:String,
        required:[true,"autoTags is required"],
        trim:true,
    },

    price:{
        actual:{
            type:Number,
            required:[true,"Price is required"],
            min: [0, 'Price can not be negative']
        },
        discount:{
            type:Number,
            default:0,
            max: [99, 'Discount must be less than 100'],
            min: [0, 'Discount must be greater than 0'] 
        },
        net:{
            type:Number,
            required:[true,"Net amount required"]
        }
    },

    stock:{
        type:Number,
        min: [0, 'Stock can not be negative'],
        default:1,
    },

    images:{
        thumbnail:{
            public_id:{
                type:String,
                required:[true,"public_id must be given"],
            },
            url:{
                type:String,
                required:[true,"There must be a thumbnail"],
            }
        },
        additional:[
            {
                public_id:{
                    type:String,
                    required:[true,"public_id must be given"],
                },
                url:{
                    type:String,
                    required:[true,"There must be a thumbnail"],
                }
            }
        ]
    },

    totalReviews:{
        type:Number,
        default:0
    },

    overallRating:{
        type:Number,
        default:0
    },

    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"user",
                required:[true,"User Id is missing"],
            },
            name: {
                type: String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            },
            verified:{
                type:Boolean,
                default:false,
                require:true
            }
        }
    ],
    
    seller:{
        type:mongoose.Schema.ObjectId,
        ref:"seller",
        required:[true,"Seller Id is missing"],
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

})


// Model Export __________________________________________
const Product = mongoose.model("product",productSchema)
export default Product






// actually it is like below
// review:[
//    type:[
//             {
//                 userName: {
//                     type: String,
//                 },
//                 userRating:{
//                     type:Number
//                 },
//                 userMessage:{
//                     type:String
//                 }
//             }
//         ]
// }