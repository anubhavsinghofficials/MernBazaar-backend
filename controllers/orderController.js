

import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'


// _______________________________ USER CONTROLLERS

export const newOrder = async (req,res) => {
    const {shippingInfo, orderItems, paymentInfo, totalPrice} = req.body

    if (!shippingInfo || !orderItems || !paymentInfo || !totalPrice) {
        return res.status(400).json({error:"please fill all the details"})
    }

    const order = new Order({
        shippingInfo,
        orderItems,
        user:req.user._id,
        paymentInfo,
        paidAt:Date.now(),
        totalPrice,
    })

    try {
        const createdOrder = await order.save()
        res.status(200).json({message:"order created Successfully",createdOrder})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}


export const getSingleOrder = async (req,res) => {
    try {
        const foundOrder = await Order.findById(req.params.id)
                                      .populate("user","name email")
        if (!foundOrder) {
            return res.status(400).json({error:"Order not found"})
        }

        res.status(200).json({order:foundOrder})
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}

// add !pageNo || !pageLength || at everywhere needed
export const getAllUserOrders = async (req,res) => {
    try {
        // const foundOrders = await Order.find({user:req.user._id.toString()})
        const foundOrders = await Order.find({user:req.user._id})
        if (!foundOrders) {
            res.status(400).json({error:"no order found"})
        }

        res.status(200).json({totalOrders:foundOrders.length,orders:foundOrders})

    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



// _______________________________ SELLER CONTROLLERS



// send different data as the func r same for user
export const getSingleOrderSeller = async (req,res) => {
    try {
        const foundOrder = await Order.findById(req.params.id)
                                      .populate("user","name email")
        if (!foundOrder) {
            return res.status(400).json({error:"Order not found"})
        }

        res.status(200).json({order:foundOrder})
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



// this is too much load on just one call, break it into
// specific functions according to the front end
export const getAllOrders = async (req,res) => {
    try {
        const {pageNo, pageLength, orderStatus} = req.query
        
        if (!pageNo || !pageLength || isNaN(pageNo) || isNaN(pageLength) || +pageNo<1 || +pageLength<1) {
            return res.status(400).json({error:"Invalid Page Length or Page Number"})
        }
        if (!["delivered", "shipped", "pending"].includes(orderStatus)) {
            return res.status(400).json({error:"invalid order status"})
        }

        const AllOrders = await Order.find()
        let orders = await Order.find({orderStatus})
        if (!orders) {
            res.status(400).json({error:"no order found"})
        }
        // why not delivereddOrders = total - pending - shipped
        // and instead of countDocuments, just filter from AllOrders
        const totalOrders = await Order.countDocuments()
        const pendingOrders = await Order.countDocuments({orderStatus:"pending"})
        const shippedOrders = await Order.countDocuments({orderStatus:"shipped"})
        const deliveredOrders = await Order.countDocuments({orderStatus:"delivered"})
        const totalAmount = AllOrders.reduce((acc,curr) => acc + curr.totalPrice,0) 

        const start = (+pageNo-1)*(+pageLength)
        const end = (+pageNo)*(+pageLength)
        orders = orders.slice(start,end)

        res.status(200).json({totalAmount, totalOrders, pendingOrders, shippedOrders, deliveredOrders, orders})

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
            return res.status(400).json({error:"Product is already delieverd!!"})
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


export const deleteOrder = async (req,res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id)
        if (!order) {
            return res.status(400).json({error:"no order found"})
        }

        res.status(200).json({deletedOrder:order})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}








// ________________________________ HELPER FUNCTIONS

async function updateStock(id,quantity) {
    try {
        const product = await Product.findByIdAndUpdate(id,{
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