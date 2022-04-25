import sendEmail from '../src/email/email-sending.js'

const message = {
    from: '"Dev the kim" <devmail1406@gmail.com>',
    to: '"Kim, the dev" <kimdev3d@gmail.com>',
    subject: 'Testing message',
    text: 'Test to see how this works'
}

sendEmail(
    message
).then(() => {
    console.log('Operation was successful')
}).catch((e) => {
    console.log(e)
})