

import Product from '../models/productModel.js'


// _____________________________________ADMIN ROUTES
//--------------------------------------------------



export const createProduct = async (req,res) => {
    const {price, title, description, category} = req.body
    
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

        let autoTags = product.autoTags

        if (title)
        autoTags = autoTags.replace(product.description, description)
        if (description)
        autoTags = autoTags.replace(product.description, description)
        if (category)
        autoTags = autoTags.replace(product.category, category)


        // see bottom comments
        const result = await Product.findByIdAndUpdate(req.params.id,
                                                       {...req.body,autoTags},{
                                                        new:true,
                                                        runValidators:true
                                                       })
        res.status(200).json({result})

    } catch (error) {
        res.status(400).json({error:error.message})
    }
}




export const deleteProduct = async (req,res) => {
    try {
        // u can also findById and then after if(!product), product.remove()                                     
        const product = await Product.findByIdAndDelete(req.params.id)

        if (!product) {
           return res.status(400).json({error:"product doesn't exist already"})
        }

        res.status(200).json({product})
    
    } catch (error) {
        res.status(400).json({error:error.message})
    }

}




// ______________________________________USER ROUTES
//--------------------------------------------------


export const getProducts = async (req,res) => {
    try {
        const {keyword,pageNo,pageLength} = req.query
        let products;

        const searchFilter = keyword ? { autoTags: {$regex:keyword, $options:'i'} }
                                     : {};

        products = await Product.find(searchFilter)
                                .skip((+pageNo - 1)*(+pageLength))
                                .limit(pageLength)

        res.status(200).json(products)

    } catch (error) {
        res.status(400).json({error:error.message})
    }
}





export const getProductDetails = async (req,res) => {
    try {
        const productDetails = await Product.findById(req.params.id)

        if (!productDetails) {
            return res.status(400).json({error:"Product not found"})
        }

        res.status(200).json({productDetails})
    
    } catch (error) {
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