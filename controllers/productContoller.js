

import Product from '../models/productModel.js'


// ________________________________ SELLER ROUTES

export const createProduct = async (req,res) => {

    const {price, title, description, category} = req.body

    req.body.seller = req.seller._id
    // or seller = req.seller._id
    // then add seller to new Product({})
    
    const net = price.actual*(1 - price.discount/100)
    const updatedPrice = {...price, net}

    const autoTags = `${title} ${description} ${category}`

    const product = new Product({...req.body,price:updatedPrice, autoTags})

    try {
        const createdProduct = await product.save()
        res.status(200).json({createdProduct})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}




export const updateProduct = async (req,res) => {
    try {
        const {title, description, category} = req.body
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(400).json({error:"product not found"})
        }

        // see comments at bottom to see why we used toString()
        if (product.seller.toString() !== req.seller._id.toString()) {
            return res.status(400).json({error:"You can only update your own products"})
        }   // is this even needed ?

        let autoTags = product.autoTags

        autoTags = title ? autoTags.replace(product.title, title) : autoTags
        autoTags = description ? autoTags.replace(product.description, description) : autoTags
        autoTags = category ? autoTags.replace(product.category, category) : autoTags

        // see bottom comments
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id,{...req.body,autoTags},{ new:true, runValidators:true })
        res.status(200).json({updatedProduct})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}




export const deleteProduct = async (req,res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(400).json({error:"product not found"})
        }
        if (product.seller.toString() !== req.seller._id.toString()) {
            return res.status(400).json({error:"You can only delete your own products"})
        }

        const deletedProduct = await Product.findByIdAndDelete(req.params.id)
        res.status(200).json({deletedProduct})
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}





// _______________________________ GENERAL ROUTES

export const getProducts = async (req,res) => {
    try {
        const {keyword,category,price,pageNo,pageLength} = req.query

        let filter = keyword ? {autoTags:{$regex:keyword,$options:'i'}}:{}
            filter = category ? {...filter, category}:{...filter}
            
        if (price) {
            // this price is in the form of {gt:'0.1'}, but for mongoose
            // we should have {'$gt':0.1}, thats what we are doing here
            const regex = /\b(gt|gte|lt|lte)\b/g
            const netPriceString = JSON.stringify(price)
                                       .replace(regex, key => `$${key}`)
            const netPrice = JSON.parse(netPriceString)
            Object.keys(netPrice).forEach(key => netPrice[key] = +netPrice[key])
            filter = {...filter, "price.net":netPrice}
        }

        const products = await Product.find(filter)
                                      .limit(pageLength)
                                      .skip((+pageNo - 1)*(+pageLength))

        const totalProducts = await Product.countDocuments(filter)

        res.status(200).json({totalProducts,products})

    } catch (error) {
        res.status(400).json({error:error.message})
    }
}




export const getProductDetails = async (req,res) => {
    try {
        const productDetails = await Product.findById(req.params.id)
                                    .populate({
                                        path:"seller",
                                        select:"name email avatar.url description joinedAt mernScore"
                                    })
        if (!productDetails) {
            return res.status(400).json({error:"Product not found"})
        }

        res.status(200).json({productDetails})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}












// Learnings___________________________________________

// product.images.thumbnail.url = "updated xyz"
// const result = await product.save()
// vs
// const result = await Product.findByIdAndUpdate(req.params.id,{
//     $set: { 'images.thumbnail.url': 'updated 2 xyz' } 
// })


// why used toString() ??
// These are object-ids/objects (see type of), so if you
// compare it would result false even if they look same
// strings thats why we used toString() (which is a non-
// mutating method) to convert to string and then compare