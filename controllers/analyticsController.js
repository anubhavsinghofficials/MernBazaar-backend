

import User from '../models/userModel.js'
import Product from '../models/productModel.js'
import Order from '../models/orderModel.js'
import { months } from '../utils.js'


export const getHighlights = async (_req,res) => {
    try {
        const productsCount = await Product.find().countDocuments()
        const usersCount = await User.find().countDocuments()
        const ordersCount = await Order.find().countDocuments()

        const resultArray = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalPrice' }
                },
            },
            {
                $project: {
                    _id: 0,
                    revenue: 1
                }
            }
        ]);
        
        const revenue = resultArray.length > 0 ? resultArray[0].revenue : 0;
        
        res.status(200).json({productsCount, usersCount, ordersCount, revenue})
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}




export const getInventory = async (_req,res) => {
    try {
        const inventory = await Product.aggregate([
            {
                $group:{
                    _id:'$category',
                    inStock: {
                        $sum: {
                            $cond: [{
                                $gt:['$stock',0]
                            },1,0]
                        }
                    },
                    outOfStock: {
                        $sum : {
                            $cond : [{
                                $eq:['$stock',0]
                            },1,0]
                        }
                    }
                }
            },{
                $project : {
                    _id : 0,
                    category : '$_id',
                    inStock : 1,
                    outOfStock : 1
                }
            }
        ])

        res.status(200).json({inventory})
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}




export const getSellerScores = async (req,res) => {
    try {

        const sellerRatingsDb = await Product.aggregate([
            {
                $unwind : '$reviews'
            },{
                $project : {
                    _id : 0,
                    ratingGroup : {
                        $switch : {
                            branches : [
                                {
                                    case : { $lte : ['$reviews.rating',1]},
                                    then: '1'
                                },{
                                    case : { $lte : ['$reviews.rating',2]},
                                    then: '2'
                                },{
                                    case : { $lte : ['$reviews.rating',3]},
                                    then: '3'
                                },{
                                    case : { $lte : ['$reviews.rating',4]},
                                    then: '4'
                                },{
                                    case : { $lte : ['$reviews.rating',5]},
                                    then: '5'
                                }
                            ],
                            default : 'unknownRatingGroup' 
                        }
                    }
                }
            },{
                $group : {
                    _id     : '$ratingGroup',
                    users   : {$sum:1}
                }
            },{
                $project : {
                    _id : 0,
                    rating : '$_id',
                    users : 1
                }
            }
        ])


        const scoreData = []
        const possibleRatingGroups = ['1', '2', '3', '4', '5'];
        possibleRatingGroups.forEach(rating => {
            const result = sellerRatingsDb.find(item => item.rating === rating)
            const users = result ? result.users : 0
            scoreData.push({rating,users})
        })

        const sellerScore = req.seller.sellerScore

        res.status(200).json({sellerScore,scoreData})
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}




export const getInsights = async (_req,res) => {
    try {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth()-12)

        const userAggregation = await User.aggregate([
            {
                $match : {
                    // $gte : [ '$joinedAt', startDate ]
                    joinedAt : { $gte : startDate }
                }
            },{
                $project : {
                    month : { $month : { $toDate : '$joinedAt' } }
                }
            },{
                $group : {
                    _id : '$month',
                    users : { $sum : 1 }
                }
            },{
                $sort : { _id : 1 }
            }
        ])

        const revenueAggregation = await Order.aggregate([
            {
                $match : {
                    paidAt : { $gte : startDate }
                }
            },{
                $project : {
                    _id : 0,
                    month : { $month : { $toDate : '$paidAt' } },
                    totalPrice : 1
                }
            },{
                $group : {
                    _id : '$month',
                    revenue : { $sum : '$totalPrice' }
                }
            },{
                $sort : { _id : 1 }
            }
        ])

        const userInsights = []
        userAggregation.forEach(element => {
            const month = months[element._id - 1]
            const users = element.users
            userInsights.push({ month,users })
        })
        const revenueInsights = []
        revenueAggregation.forEach(element => {
            const month = months[element._id - 1]
            const revenue = element.revenue
            revenueInsights.push({ month,revenue })
        })

        res.status(200).json({userInsights, revenueInsights})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}










// const data = await User.aggregate([
//     {
//         $project : {
//             year  : { $year : { $toDate : '$joinedAt' } },
//             month : { $month : { $toDate : '$joinedAt' } }
//         }
//     },{
//         $group : {
//             _id   : { year : '$year', month : '$month' },
//             users : { $sum : 1 }
//         }
//     }
// ])