import nodemailer from 'nodemailer'
import googleapis from 'googleapis'
const { google } = googleapis
const OAuth2 = google.auth.OAuth2
if(process.env.NODE_ENV !== 'production') {
    await import('dotenv').then((dotenv) => {
        dotenv.config()
    })
}

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
    )

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    })

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            reject("Failed to create access token :(")
          }
          resolve(token);
        })
    })
    
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
        }
    })

    return transporter
}

const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter()
    await emailTransporter.sendMail(emailOptions)
}

export default sendEmail