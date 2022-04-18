const GoogleStrategy = require('passport-google-oauth20').Strategy
const KakaoStrategy = require('passport-kakao').Strategy
const config = require('../config')

const options = {
    GOOGLE: {
        clientId: config.LOGIN_GOOGLE_CLIENT_ID,
        secret: config.LOGIN_GOOGLE_SECRET,
        callback: config.LOGIN_GOOGLE_CALLBACK
    },
    KAKAO: {
        clientId: config.LOGIN_KAKAO_CLIENT_ID,
        secret: config.LOGIN_KAKAO_SECRET,
        callback: config.LOGIN_KAKAO_CALLBACK
    }
}

module.exports = (app) => (passport) => {
    app.use(passport.initialize())
    app.use(passport.session())

    //console.log('serialize user', user)
    passport.serializeUser((user, done) => {
        done(null, user)
    })

    //console.log('deserialize user', user)
    passport.deserializeUser((user, done) => {
        done(null, user)
    })

    passport.use(new GoogleStrategy({
                clientID: options.GOOGLE.clientId,
                clientSecret: options.GOOGLE.secret,
                callbackURL: options.GOOGLE.callback,
            },
            (accessToken, refreshToken, profile, done) => {
                console.log('GoogleStrategy', accessToken, refreshToken, profile)
                return done(null, profile)
            }
        )
    )

    passport.use(new KakaoStrategy({
                clientID: options.KAKAO.clientId,
                //clientSecret: options.KAKAO.secret,
                callbackURL: options.KAKAO.callback,
            },
            (accessToken, refreshToken, profile, done) => {
                console.log('KakaoStrategy', accessToken, refreshToken, profile)
                return done(null, {profile, accessToken})
            }
        )
    )
}
