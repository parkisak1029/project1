const path = require('path')
const dotenv = require('dotenv')

dotenv.config(
    {path: path.join(__dirname, `/.env`)},
)

module.exports = Object.freeze({
    // DB
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,

    // Mail
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,

    // Login
    LOGIN_GOOGLE_CLIENT_ID: process.env.LOGIN_GOOGLE_CLIENT_ID,
    LOGIN_GOOGLE_SECRET: process.env.LOGIN_GOOGLE_SECRET,
    LOGIN_GOOGLE_CALLBACK: process.env.LOGIN_GOOGLE_CALLBACK,

    LOGIN_KAKAO_CLIENT_ID: process.env.LOGIN_KAKAO_CLIENT_ID,
    LOGIN_KAKAO_SECRET: process.env.LOGIN_KAKAO_SECRET,
    LOGIN_KAKAO_CALLBACK: process.env.LOGIN_KAKAO_CALLBACK,


})
