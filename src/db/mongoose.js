import mongoose from 'mongoose'
if(process.env.NODE_ENV !== 'production') {
    await import('dotenv').then((dotenv) => {
        dotenv.config()
    })
}

mongoose.connect(process.env.MONGODB_URL)