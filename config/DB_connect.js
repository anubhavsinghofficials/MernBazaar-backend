

import mongoose from 'mongoose'
// const DB = process.env.DB_URL
// the above will be undefined when connectToDatabase
// is called in the app.js thats why we did it inside
// the connectToDatabase function itself

const connectToDatabase = () => {
    const DB = process.env.DB_URL
    mongoose.connect(`${DB}/MernBazaar`)
            .then(data => console.log(`> ${data.connection.name} db connected`))
            .catch(error => console.log(error))
}

export default connectToDatabase