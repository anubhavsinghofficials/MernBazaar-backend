

import mongoose from 'mongoose'
import server from '../app.js'
// const DB = process.env.DB_URL
// the above will be undefined when connectToDatabase
// is called in the app.js thats why we did it inside
// the connectToDatabase function itself

const connectToDatabase = () => {
    const DB = process.env.DB_URL
    mongoose.connect(`${DB}/MernBazaar`)
            .then(data => console.log(`> ${data.connection.name} db connected`))
            .catch(error => {
                console.log({error:error.message,message:"closing the server"})
                server.close(() => {
                    console.log("Server closed, exiting node process")
                    process.exit()
                })

                // or may be retry 2-3 times..
                // also, can use process.on() like 6pp
                // instead of this catch block
            })
}

export default connectToDatabase