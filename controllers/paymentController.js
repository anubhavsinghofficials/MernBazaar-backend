
import Stripe from 'stripe'


export const processPayment = async (req,res) => {

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const mypayment = await stripe.paymentIntents.create({
            amount:req.body.amount,
            currency:"inr",
            metadata:{
                company:"MernBazaar"
            }
        }) 
        res.status(200).json({client_secret:mypayment.client_secret})
    }
    catch (error) {
        res.status(400).json({error:error.message})
    }
}