import app from './app.js'

const port = process.env.port

app.listen(port, () => {
    console.log('Server is up on port:', port)
})