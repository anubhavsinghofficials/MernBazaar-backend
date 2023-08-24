

import {config} from 'dotenv'
config({path:"./config/.env"})
import express from 'express'
import connectToDatabase from './config/DB_connect.js'
import productRoute from './routes/productRoute.js'


const PORT = process.env.PORT
const app = express()



connectToDatabase()
app.use(express.json())
app.use("/api/v1",productRoute)



const server = app.listen(PORT, ()=>{
                console.log(`> listening at http://localhost:${PORT}`)
            })


export default server