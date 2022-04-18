const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const express = require("express");
const axios = require('axios')
const app = express();
const host = "127.0.0.1";
const port = 3000;


app.set("view engine", "ejs");
app.set("views", './src/views')

app.use(express.static(`${__dirname}/src/public`));
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    key: 'sid',
    secret: 'secret key',
    resave: false,
    saveUninitialized: true
}));

const passportUtil = require('./src/utility/passportUtil')(app)
passportUtil(passport);

const mysqlRouter = require('./src/routes/mysql');
const boardRouter = require('./src/routes/board');
const userRouter = require('./src/routes/user');
const authRouter = require('./src/routes/auth');
const musicRouter = require('./src/routes/music')
const cartRouter = require('./src/routes/cartlist')

app.use('/mysql', mysqlRouter);
app.use('/board', boardRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/music', musicRouter);
app.use('/cartlist', cartRouter);

app.use('/uploads', express.static('uploads'));
app.use('/uploadsmp', express.static('uploadsmp'));

// root
app.get("/", (req, res) => {
    res.render("index.ejs")
    // res.redirect('/selling')
});

// login 페이지
app.get("/login", (req, res) => {
    res.render("login.ejs")
});

// logout 페이지
app.get("/logout",async (req, res) => {

    const {userInfo} = req.session
    if (userInfo !== undefined) {
        if (userInfo.who !== undefined && userInfo.who === 'kakao') {
            try {
                let logout = await axios({
                    method: 'post',
                    url: 'https://kapi.kakao.com/v1/user/unlink',
                    headers: {
                        'Authorization': `Bearer ${userInfo.accessToken}`
                    }
                });
            } catch (error) {
                console.error(error);
                res.json(error);
            }
        }
    }

    // 세션 삭제
    req.session.destroy();
    req.logout();
    res.redirect('/music/selling')
});

// signUp 페이지
app.get("/signUp", (req, res) => {
    res.render("signUp.ejs")
});

// init 페이지
app.get("/init", (req, res) => {
    res.render("init.ejs")
});

// passport 페이지
app.get("/passport", (req, res) => {
    const {email} = JSON.parse(JSON.stringify(req.query))
    res.render("passport.ejs", {email})
});

// selling 페이지
// app.get("/selling", (req, res) => {
//     const userInfo = req.session.userInfo
//     if (userInfo === undefined) {
//         res.render('selling.ejs')
//     } else {
//         res.render('loginselling.ejs', {userInfo:userInfo.email});
//     }
// });

app.get("/contact", (req, res) => {
    res.render("signUp.ejs")
});

app.listen(port, host, () => {
    console.log(`Index Application running at http://${host}:${port}/`);
});