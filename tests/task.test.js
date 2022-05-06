import request from 'supertest'
import Task from '../src/models/task.js'
import app from '../src/app.js'
import db from './fixtures/db.js'
const { 
    userOne,
    userTwo,
    userOneId,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase 
} = db

beforeEach(async () => {
    await setupDatabase()
})

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            description: 'From my test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should get tasks for user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)
})

test('Should not delete other user tasks', async () => {
    await request(app)
        .delete(`/tasks/${ taskOne._id }`)
        .set('Authorization', `Bearer ${ userTwo.tokens[0].token }`)
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not create task with invalid description/completed', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            description: {
                name: 'Bob'
            }
        })
        .expect(400)
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            completed: 7
        })
        .expect(400)
})

test('Should not update task with invalid description/completed', async () => {
    await request(app)
        .patch(`/tasks/${ taskOne._id }`)
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            description: { 
                name: false 
            }
        })
        .expect(400)
    await request(app)
        .patch(`/tasks/${ taskOne._id }`)
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send({
            completed: 7
        })
        .expect(400)
})

test('Should delete user task', async () => {
    await request(app)
        .delete(`/tasks/${ taskOne._id }`)
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send()
        .expect(200)
})

test('Should not delete task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${ taskOne._id }`)
        .send()
        .expect(401)
})

test('Should not update other users task', async () => {
    await request(app)
        .delete(`/tasks/${ taskOne._id }`)
        .set('Authorization', `Bearer ${ userTwo.tokens[0].token }`)
        .send()
        .expect(404)
})

test('Should fetch user task by id', async () => {
    await request(app)
        .get(`/tasks/${ taskOne._id }`)
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send()
        .expect(200)
})

test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
        .get(`/tasks/${ taskOne._id }`)
        .send()
        .expect(401)
})

test('Should not fetch other users task by id', async () => {
    await request(app)
        .get(`/tasks/${ taskOne._id }`)
        .set('Authorization', `Bearer ${ userTwo.tokens[0].token }`)
        .send()
        .expect(404)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
        .get(`/tasks`)
        .query({ completed: true })
        .set('Authorization', `Bearer ${ userTwo.tokens[0].token }`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(1)
})

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get(`/tasks`)
        .query({ completed: false })
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(1)
})

test('Should sort tasks by description/completed/createdAt/updatedAt', async () => {
    await request(app)
        .get(`/tasks?completed=true`)
        .set('Authorization', `Bearer ${ userTwo.tokens[0].token }`)
        .send()
        .expect(200)
    await request(app)
        .get(`/tasks?sortBy=createdAt_asc`)
        .set('Authorization', `Bearer ${ userTwo.tokens[0].token }`)
        .send()
        .expect(200)
    await request(app)
        .get(`/tasks?sortBy=updatedAt_asc`)
        .set('Authorization', `Bearer ${ userTwo.tokens[0].token }`)
        .send()
        .expect(200)
    await request(app)
        .get(`/tasks?completed=false`)
        .set('Authorization', `Bearer ${ userTwo.tokens[0].token }`)
        .send()
        .expect(200)
})

test('Should fetch page of tasks', async () => {
    await request(app)
        .get(`/tasks?limit=1`)
        .set('Authorization', `Bearer ${ userTwo.tokens[0].token }`)
        .send()
        .expect(200)
})