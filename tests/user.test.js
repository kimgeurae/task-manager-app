import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/user.js'
import db from './fixtures/db.js'
const { userOne, userOneId, setupDatabase } = db

beforeEach(async () => {
    await setupDatabase()
})

test('Should signup a new user', async () => {
    const response = await request(app)
        .post('/users/signup')
        .send({
            name: 'Testing Kim',
            email: 'kimdev3d@gmail.com',
            password: 'TestingPass@123'
        })
        .expect(201)

    // Asserts that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Testing Kim',
            email: 'kimdev3d@gmail.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('TestingPass@123')
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)
    
    const user = await User.findById(userOneId)

    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should not login nonexistent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'bad@example.com',
            password: 'wrong@credential123'
        })
        .expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send()
        .expect(200)
    
    const user = await User.findById(userOneId)

    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            name: 'Jonny'
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toBe('Jonny')
})

test('Should not update invalid user field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            location: 'Denver'
        })
        .expect(400)
})

test('Should not signup user with invalid name/email/password', async () => {
    await request(app)
        .post('/users/signup')
        .send({
            name: {
                location: 'denver'
            },
            email: 'kim@example.com',
            password: 'Gilson@123'

        })
        .expect(400)
    await request(app)
        .post('/users/signup')
        .send({
            name: 'Lucas',
            email: 'foo#12',
            password: 'Gilsons@123'

        })
        .expect(400)
    await request(app)
        .post('/users/signup')
        .send({
            name: 'Lucas',
            email: 'lucas@example.com',
            password: 'password'

        })
        .expect(400)
})

test('Should not update user if unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Kim'
        })
        .expect(401)
})

test('Should not update user with invalid name/email/password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            name: {
                description: 'Bleh'
            }
        })
        .expect(400)
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            email: 'kim#foo.yz'
        })
        .expect(400)
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            password: 'password'
        })
        .expect(400)
})

test('Should not delete user if unauthenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})