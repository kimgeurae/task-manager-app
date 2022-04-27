import express from 'express'
import './db/mongoose.js'
import userRouter from './routers/user.js'
import taskRouter from './routers/task.js'
if(process.env.NODE_ENV !== 'production') {
    await import('dotenv').then((dotenv) => {
        console.log('dotenv loaded')
        dotenv.config()
    })
}

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port:', port)
})