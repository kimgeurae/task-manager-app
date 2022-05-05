import express from 'express'
import multer from 'multer'
import sharp from 'sharp'
import User from '../models/user.js'
import auth from '../middleware/auth.js'
import sendEmail from '../email/email-sending.js'

const router = new express.Router()

router.post('/users/signup', async(req, res) => {
    const user = new User(req.body)
    const message = {
        from: '"Dev the kim" <devmail1406@gmail.com>',
        to: `"${user.name}" <${user.email}>`,
        subject: `Welcome to the task-manager app, ${user.name}!`,
        text: 'Thanks for signing up'
    }
    try {
        await user.save()
        const token = await user.generateAuthToken()
        await sendEmail(message).then(() => {
            console.log('Welcome mail sended successfully')
        }).catch((e) => {
            console.log(e)
        })
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch(e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'name', 'email', 'password', 'age' ]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' })

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
        // res.status(500).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    const _id = req.user._id
    
    try {
        await req.user.remove()
        const message = {
            from: '"Dev the kim" <devmail1406@gmail.com>',
            to: `"${req.user.name}" <${req.user.email}>`,
            subject: `Farewell ${req.user.name}!`,
            text: 'Thanks staying with us all this time, please tell us why you\'re leaving and what would it take to keep you onboard.'
        }
        await sendEmail(message).then(() => {
            console.log('Farewell mail sended successfully')
        }).catch((e) => {
            console.log(e)
        })
        res.send(req.user)
    } catch(e) {
        res.status(500).send()
    }
})

const regexImageValidation = /\.(jpg|jpeg|png)$/

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(regexImageValidation)) {
            return cb(new Error('File must be a .jpg, .jpeg or .png format.'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    const statusCode = error.message === 'File must be a .jpg, .jpeg or .png format.' ? 415 : 400
    res.status(statusCode).send({ Error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    if(!req.user.avatar) return res.status(404).send()
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(400).send()
    }    
})

router.get('/users/:id/avatar', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if(!user || !user.avatar) {
            console.log('error called')
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

export default router