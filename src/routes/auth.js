const express = require('express');
const passport = require('passport')
const router = express.Router();

router.get('/login/google', passport.authenticate('google', { scope: ['email','profile'] }))
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        console.log('callback login from google', req.user)

        req.session.userInfo = {
            email: req.user.emails[0].value,
            name : req.user.displayName,
            who : req.user.provider
        }
        res.redirect('/')
    }
)

router.get('/login/kakao', passport.authenticate('kakao'))
router.get('/kakao/callback',
    passport.authenticate('kakao', { failureRedirect: '/login' }),
    (req, res) => {
        console.log('callback login from kakao', req.user)


        req.session.userInfo = {
            email: req.user.profile._json.kakao_account.email,
            name : req.user.profile.displayName,
            who : req.user.profile.provider,
            accessToken : req.user.accessToken
        }

        res.redirect('/')
    })

module.exports = router;
// https://goodmemory.tistory.com/97