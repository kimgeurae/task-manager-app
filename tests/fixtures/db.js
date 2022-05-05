import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../../src/models/user.js'
import Task from '../../src/models/task.js'

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name: 'Lucas',
    email: 'lucas@example.com',
    password: 'Gilsons@123',
    tokens:[{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()

const userTwo = {
    _id: userTwoId,
    name: 'Beka',
    email: 'beka@example.com',
    password: 'Marinasena@123',
    tokens:[{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First Task',
    completed: 'false',
    author: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second Task',
    completed: 'true',
    author: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third Task',
    completed: 'true',
    author: userTwoId
}

const setupDatabase = async () => {
    await User.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await Task.deleteMany()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

export default {
    userOne,
    userTwo,
    userOneId,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}