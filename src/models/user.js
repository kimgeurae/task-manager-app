import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Task from './task.js'
import dotenv from 'dotenv'
dotenv.config()

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        validate(value) {
            if(value <= 0) throw new Error('Age must be a positive number different from Zero.')
        }
    },
    email: {
        type: String,
        unique: true,
        require: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) throw new Error('Email must be valid.')
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')) throw new Error('Password cannot contains \'password\'')
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'author'
})

// Middleware for hashing the plain text password before saving

userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ author: user._id })
    next()
})

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user) throw new Error('Unable to login')

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) throw new Error ('Unable to login')

    return user
}

const User = mongoose.model('User', userSchema)

export default User