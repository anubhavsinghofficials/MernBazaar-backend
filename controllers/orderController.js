

import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'


// _______________________________ USER CONTROLLERS

export const newOrder = async (req,res) => {
    const {shippingInfo, isNewAddress, orderItems, paymentInfo, totalPrice} = req.body
    if (!shippingInfo || !orderItems || !paymentInfo || !totalPrice || isNewAddress===null || isNewAddress===undefined) {
        return res.status(400).json({error:"Kindly fill all the details"})
    }

    try {
        if (isNewAddress) {
            req.user.shippingInfo = [...req.user.shippingInfo,shippingInfo]
        }
        req.user.cart = []
        await req.user.save()

        await Order.create({
            shippingInfo,
            orderItems,
            user:req.user._id,
            paymentInfo,
            paidAt:Date.now(),
            totalPrice,
        })
        res.status(200).json({message:"order created Successfully"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getAllUserOrders = async (req,res) => {
    try {
        // reverse the order of orders atleast
        const foundOrders = await Order.find({user:req.user._id}).sort({ createdAt: -1})
        res.status(200).json({totalOrders:foundOrders.length,orders:foundOrders})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



// _______________________________ SELLER CONTROLLERS

// send different data as the func r same for user
export const getSingleOrderSeller = async (req,res) => {
    try {
        const foundOrder = await Order.findById(req.params.id).populate("user","name email")
        if (!foundOrder) {
            return res.status(400).json({error:"Order not found"})
        }

        res.status(200).json({order:foundOrder})
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getAllOrders = async (req,res) => {
    const { pageNo, pageLength, orderStatus, sort } = req.query
    
    if (!pageNo || !pageLength || isNaN(pageNo) || isNaN(pageLength) || +pageNo<1 || +pageLength<1) {
        return res.status(400).json({error:"Invalid Page Length or Page Number"})
    }

    if ( orderStatus &&!["delivered", "shipped", "pending"].includes(orderStatus)) {
        return res.status(400).json({error:"invalid order status"})
    }

    const filter = orderStatus ? {orderStatus} :{}
    let sortCreteria = { createdAt:-1 }
    if (sort) {
        const validSortFields = ['totalItems', 'totalPrice', 'createdAt']
        const validSortOrders = ['-1', '1']
        const [sortField, sortOrder] = sort.split('|')

        if (!validSortFields.includes(sortField) || !validSortOrders.includes(sortOrder)) {
            return res.status(400).json({ error: 'Invalid sort parameters' })
        } else if (sortField === 'totalItems') {
            sortCreteria = {'totalItems':+sortOrder}
        } else if (sortField === 'totalPrice'){
            sortCreteria = {'totalPrice':+sortOrder}
        } else if (sortField === 'createdAt') {
            sortCreteria = {'createdAt':+sortOrder}
        }
    }

    try{
        const totalOrders = await Order.countDocuments(filter)
        const orders = await Order.aggregate([
            {
                $match: filter
            },{
                $project: {
                    _id: 1,
                    orderStatus: 1,
                    totalPrice: 1,
                    createdAt: 1,
                    totalItems: { $size: '$orderItems' }
                }
            },{
                $sort: sortCreteria
            },{
                $skip: (+pageNo - 1)*(+pageLength)
            },{
                $limit: +pageLength
            }
        ])

        res.status(200).json({totalOrders,orders})

    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



// make it all query based rather than params & body ?
export const updateOrderStatus = async (req,res) => {
    try {
        const {status} = req.body
        if (!["delivered", "shipped", "pending"].includes(status)) {
            return res.status(400).json({error:"invalid order status"})
        }

        const order = await Order.findById(req.params.id)
        if (!order) {
            return res.status(400).json({error:"order not found"})
        }
        else if (order.orderStatus === 'delivered') {
            return res.status(400).json({error:"Product is already delieverd"})
        }

        // updating the product stocks
        for (const orderitem of order.orderItems) {
            await updateStock(orderitem.product, orderitem.quantity)
        }

        order.orderStatus = status
        if (order.orderStatus === "delivered") {
            order.deliveredAt = Date.now()
        }

        const updatedOrder = await order.save()
        res.status(200).json({updatedOrder})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}








// ________________________________ HELPER FUNCTIONS

async function updateStock(id,quantity) {
    try {
        await Product.findByIdAndUpdate(id,{
            $inc:{stock:-quantity}
        }) // what if stock goes -ve from this?
    
    } catch (error) {
        throw new Error(error.message);
    }    
}
 

















// after cart or buy or after delivered product
// or at any other complex ? condition
// decrease stock from the original products
// also how to from user cart ???


// there must be a stock other wise don't let the
// user add to cart or buy

// when a product is deleted, also delete it from
// the user's cart !! same for the case when order
// is delievered