

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



// what about updating the price/images/stock ????
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





// __________________________________ USER ROUTES

export const reviewProduct = async (req,res) => {
    try {
        const {userRating, userComment} = req.body
        const {id} = req.params

        if (!id || !userRating || !userComment) {
            return res.status(400).json({error:"please fill all the details"})
        }

        const foundProduct = await Product.findById(id)
        if (!foundProduct) {
            return res.status(400).json({error:"Product doesn't exists!!"})
        }

        const count = foundProduct.totalReviews
        const oldRating = foundProduct.overallRating
        const existingReview = foundProduct.reviews.find(rev => (
                                rev.user.toString() === req.user._id.toString()
                               ))
        const newRating = existingReview
                          ? (oldRating*count - existingReview.rating + (+userRating))/(count)
                          : (oldRating*count + (+userRating))/(count+1)

        if (existingReview) {
            existingReview.rating = +userRating
            existingReview.comment = userComment
            foundProduct.overallRating = newRating
        }
        else{
           foundProduct.totalReviews++
           foundProduct.overallRating = newRating
           const newReview = {
                user: req.user._id,
                name: req.user.name,
                rating: +userRating,
                comment: userComment
            }
           foundProduct.reviews.push(newReview)
        }

        foundProduct.save()
        res.status(200).json({updatedProduct:foundProduct})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const deleteReview = async (req,res) => {
    try {
        const foundProduct = await Product.findById(req.params.id)
        if (!foundProduct) {
            return res.status(400).json({error:"Product not found!!"})
        }

        const existingReview = foundProduct.reviews.find(rev => (
            rev.user.toString() === req.user._id.toString()
        ))

        if (!existingReview) {
            return res.status(400).json({error:"No such review found"})
        }

        // see comment 3 (although even this solution is not safe)
        const count = foundProduct.totalReviews
        const oldRating = foundProduct.overallRating
        const newRating = count !== 1
                          ? (oldRating*count - existingReview.rating)/(count-1)
                          : 0
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id,{
                                        $inc:{totalReviews:-1},
                                        $set:{overallRating:newRating},
                                        $pull:{reviews:{user:existingReview.user.toString()}}  
                                    })

        res.status(200).json({message:"Your review removed successfully"})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getAllReviews = async (req,res) => {
    try {
        const {pageNo, pageLength} = req.query

        if (isNaN(pageNo) || isNaN(pageLength) || +pageNo<1 || +pageLength<1) {
            return res.status(400).json({error:"Invalid Page Length or Page Number"})
        }

        const foundProduct = await Product.findById(req.params.id)
        let reviews = foundProduct.reviews
        let currentUserReview = null

        if (req.user) {
            currentUserReview = reviews.find(rev => (
                rev.user.toString() === req.user._id.toString()
            ))
        }

        const totalReviews = reviews.length
        const start = (+pageNo-1)*(+pageLength)
        const end = (+pageNo)*(+pageLength)
        reviews = reviews.slice(start,end)

        res.status(200).json({currentUserReview,totalReviews,reviews})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}





// _______________________________ GENERAL ROUTES

export const getProducts = async (req,res) => {
    try {
        const {keyword,category,price,pageNo,pageLength} = req.query

        if (isNaN(pageNo) || isNaN(pageLength) || +pageNo<1 || +pageLength<1) {
            res.status(400).json({error:"Invalid Page Length or Page Number"})
        }

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
                                    // or populate("seller", "name email")
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

// comment #1
// product.images.thumbnail.url = "updated xyz"
// const result = await product.save()
// vs
// const result = await Product.findByIdAndUpdate(req.params.id,{
//     $set: { 'images.thumbnail.url': 'updated 2 xyz' } 
// })


// comment #2
// why used toString() ??
// These are object-ids/objects (see type of), so if you
// compare it would result false even if they look same
// strings thats why we used toString() (which is a non-
// mutating method) to convert to string and then compare


// comment #3
// earlier i used this approach:
// _____________________________________________________
// foundProduct.totalReviews--
// foundProduct.overallRating = newRating
// foundProduct.reviews = foundProduct.reviews.filter(rev => (
//     rev.user.toString() !== req.user._id.toString()
// ))
// await foundProduct.save()
// -----------------------------------------------------
// the problem with this is: Concurrency: When multiple users
// might try to review the same product at the same time, you
// could run into concurrency issues with your current logic.
// see this eg from stack overflow to understand more:
// https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
// so u were wrong in the way u used to think, so from now on,
// know as much as possible about mongo(or any db) provided features
// and use them instead of using javascript logic to update the things
// atomically, since it is not a function, its a server used by millions
// so u should think that way for designing the any function 