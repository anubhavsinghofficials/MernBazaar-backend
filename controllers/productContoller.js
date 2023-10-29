

import Product from '../models/productModel.js'
import Seller from '../models/sellerModel.js'
import { uploadToCloudinary } from '../helperFunctions.js'



// ________________________________ SELLER ROUTES

export const createProduct = async (req,res) => {
    const { price, title, description, category, stock } = req.body
    if (!price || !title || !description || !category || !stock || !req.files) {
        return res.status(400).json({error:'Enter all the fields'})
    }

    const thumbnailObject = {}
    const additionalArray = []
    const files = Object.values(req.files)

    try {
        await uploadToCloudinary(files,thumbnailObject,additionalArray)

        const seller = req.seller._id
        const parsedPrice = JSON.parse(price)
        const parsedDescription = JSON.parse(description)
        const parsedStock = JSON.parse(stock)
        
        const product = new Product({
            title:title,
            description:parsedDescription,
            category:category,
            price:parsedPrice,
            seller:seller,
            stock:parsedStock,
            images:{
                thumbnail:thumbnailObject,
                additional:additionalArray
            }
        })

        const createdProduct = await product.save()
        res.status(200).json({message:'Product created Successfully', productId:createdProduct._id})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



// what about updating the price/images/stock ????
export const updateProduct = async (req,res) => {
    try {
        // const {title, description, category} = req.body
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(400).json({error:"Product not found"})
        }

        // see comments at bottom to see why we used toString()
        if (product.seller.toString() !== req.seller._id.toString()) {
            return res.status(400).json({error:"You can only update your own products"})
        }   // is this even needed ?

        // see bottom comments
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id,{...req.body},{ new:true, runValidators:true })
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
            return res.status(400).json({error:"Product not found"})
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
            return res.status(400).json({error:"Kindly fill all the details"})
        }

        const foundProduct = await Product.findById(id)
        if (!foundProduct) {
            return res.status(400).json({error:"Product doesn't exists"})
        }

        const seller = await Seller.findById(foundProduct.seller)
        if (!seller) {
            return res.status(400).json({error:"Product doesn't exists"})
        }
        
        const count = foundProduct.totalReviews
        const oldRating = foundProduct.overallRating
        const existingReview = foundProduct.reviews.find(rev => (
                                rev.user.toString() === req.user._id.toString()
                               ))
        const newRating = existingReview
                          ? (oldRating*count - existingReview.rating + (+userRating))/(count)
                          : (oldRating*count + (+userRating))/(count+1)
        
        const oldSellerScore = seller.sellerScore
        const newSellerScore = existingReview
                             ? (oldSellerScore*count - existingReview.rating + (+userRating))/count
                             : (oldSellerScore*count + (+userRating))/(count+1)

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

        seller.sellerScore = newSellerScore
        await seller.save()
        await foundProduct.save()
        res.status(200).json({message:"Your review added successfully"})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const deleteReview = async (req,res) => {
    try {
        const foundProduct = await Product.findById(req.params.id)
        if (!foundProduct) {
            return res.status(400).json({error:"Product not found"})
        }
        
        const seller = await Seller.findById(foundProduct.seller)
        if (!seller) {
            return res.status(400).json({error:"Product doesn't exists"})
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

        const oldSellerScore = seller.sellerScore
        const newSellerScore = count !== 1
                             ? (oldSellerScore*count - existingReview.rating)/(count-1)
                             : 0

        seller.sellerScore = newSellerScore
        await seller.save()
        await Product.findByIdAndUpdate(req.params.id,{
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
        const productId = req.params.id
        if (!productId) {
            res.status(400).json({error:'Invalid product id, product not found!'})
        }

        if (!pageNo || !pageLength || isNaN(pageNo) || isNaN(pageLength) || +pageNo<1 || +pageLength<1) {
            return res.status(400).json({error:"Invalid Page Length or Page Number"})
        }

        const foundProduct = await Product.findById(productId)
        let allReviews = foundProduct.reviews
        let currentUserReview = null

        if (req.user) {
            currentUserReview = allReviews.find(rev => (
                rev.user.toString() === req.user._id.toString()
            ))
            currentUserReview = currentUserReview ? currentUserReview : null
            allReviews = allReviews.filter(rev => (
                rev.user.toString() !== req.user._id.toString()
            ))
        }

        const totalReviews = allReviews.length + 1
        const start = (+pageNo-1)*(+pageLength)
        const end = (+pageNo)*(+pageLength)
        allReviews = allReviews.slice(start,end)

        res.status(200).json({currentUserReview,totalReviews,allReviews})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}





// _______________________________ GENERAL ROUTES

export const getProducts = async (req,res) => {
    try {
        const { keyword, category, price, pageNo, pageLength,
                discount, ratings, sort } = req.query
        
        if (!pageNo || !pageLength || isNaN(pageNo) || isNaN(pageLength) || +pageNo<1 || +pageLength<1) {
            return res.status(400).json({error:"Invalid Page Length or Page Number"})
        }
        
        let filter = {stock:{$gt:0}}
        filter = (category && category !== "") ? {...filter,category}: filter
        filter = (keyword && keyword !== "")
                ? {...filter, $or: [
                    {title:{$regex:keyword,$options:'i'}},
                    {description:{$regex:keyword,$options:'i'}},
                    {category:{$regex:keyword,$options:'i'}},
                ]}
                : filter

        filter = discount ? {...filter, 'price.discount':{$gte:+discount}} : filter
        filter = ratings  ? {...filter, overallRating:{$gte:+ratings}} : filter

        let sortCreteria = {overallRating:-1}
        if (sort) {
            const validSortFields = ['price', 'ratings', 'date', 'discount'];
            const validSortOrders = ['-1', '1']
            const [sortField, sortOrder] = sort.split('|');

            if (!validSortFields.includes(sortField) || !validSortOrders.includes(sortOrder)) {
                return res.status(400).json({ error: 'Invalid sort parameters' });
            } else if (sortField === 'price') {
                sortCreteria = {'price.net':+sortOrder}
            } else if (sortField === 'ratings'){
                sortCreteria = {'overallRating':+sortOrder}
            } else if (sortField === 'date') {
                sortCreteria = {'createdAt':+sortOrder}
            } else if (sortField === 'discount') {
                sortCreteria = {'price.discount':+sortOrder}
            } 
        }

        if (price) {
            // this price is in the form of {gt:'0.1'}, but for mongoose
            // we should have {'$gt':0.1}, thats what we are doing here
            const regex = /\b(gt|gte|lt|lte)\b/g
            const priceRangeString = JSON.stringify(price)
                                       .replace(regex, key => `$${key}`)
            const priceRange = JSON.parse(priceRangeString)
            Object.keys(priceRange).forEach(key => priceRange[key] = +priceRange[key])
            filter = {...filter, "price.net":priceRange}
        }

        const totalProducts = await Product.countDocuments(filter)
        const products = await Product.find(filter)
                                      .select({overallRating:1,images:1,price:1,title:1,stock:1})
                                      .sort(sortCreteria)
                                      .skip((+pageNo - 1)*(+pageLength))
                                      .limit(pageLength)
                                      
        res.status(200).json({totalProducts, products})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}



export const getProductDetails = async (req,res) => {
    try {
        const productId = req.params.id
        if (!productId) {
            res.status(400).json({error:'Invalid product id, product not found!'})
        }
        const productDetails = await Product.findById(productId)
                                    .populate({
                                        path:'seller',
                                        select:'name email address description joinedAt sellerScore'
                                        // or populate("seller", "name email")
                                    })
                                    .select('category description images overallRating price seller stock title')
        if (!productDetails) {
            return res.status(400).json({error:'Product not found'})
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