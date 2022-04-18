var express = require('express');
var router = express.Router();
var mysql = require('mysql');  // db 폴더를 만들어서 conn 과 info 를 만들어 코드의 길이를 최대한줄일수도있다고한다
const session = require("express-session")
var userRouter = require('./user');
router.use(session({
    key: 'sid',
    secret: 'secret key',
    resave: false,
    saveUninitialized: true
}));
router.use('/user', userRouter);

var connection = mysql.createConnection({ // createConnection 데이터베이스 설정 입력 
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : '1234',
    database : 'project'
});

// router.get('/Selling', function(req, res, next){  // board/write 로 접속하면 글쓰기페이지로 이동
//     res.render('Selling')
// });

router.post('/Selling', function(req, res, next){
    var idx = req.body.idx;                  
    var img = req.body.img;                  
    var titlename = req.body.titlename;                  
    var singer = req.body.singer;
    var price = req.body.price
    var datas = [idx, img, titlename, singer, price]; // 모든데이터를 배열로 묶기
    // req 객체로 body 속성에서 input 파라미터 가져오기
    var sql = "insert into cart(idx, img, titlename, singer, price) values(?,?,?,?,?)";  // ? 는 매개변수
    connection.query(sql, datas, function(err,rows){ // datas 를 매개변수로 추가
        if (err) console.error("err : " + err);
        res.redirect('/cartlist/cart')
    });
    console.log(req.body);
});

router.get('/cart', function(req, res, next) {  //page/1 이 아니라  /page 로만 라우팅됫을때 /page/1 로 보내준다
    res.redirect('/cartlist/cart/1');
});
router.get('/cart/:cart', function(req, res, next){ // 게시글 리스트에 :page가 추가된것임
    var cart = req.params.cart; // 현재 페이지는 params 을 req 요청받아옴
    var sql = "select idx, img, titlename, singer, price from cart";  // select 구절 그대로
    var userInfo = req.session.userInfo;
    connection.query(sql, function(err, rows){
        if (err) console.error("err : " + err);
        if(userInfo === undefined)
        res.render('cart', {rows:rows, cart:cart, length:rows.length-1, cart_num:10, pass:true, userInfo:0})
        else
        res.render('cart', {rows:rows, cart:cart, length:rows.length-1, cart_num:10, pass:true, userInfo:userInfo.name})
        // res.render('cart', {rows:rows, cart:cart, length:rows.length-1, cart_num:10, pass:true, userInfo:userInfo.email}); 
        // length 데이터 전체넘버 랜더링,-1을 한이유는 db에서는1부터지만 for문에서는 0부터 시작 ,page_num: 한페이지에 보여줄 갯수
    });
});

router.post('/delete', function(req,res,next){

    console.log(req.body)
    // res.redirect('/cartlist/cart/1')
    var idx = req.body.idx                  
    var img = req.body.img                  
    var titlename = req.body.titlename;
    var singer = req.body.singer;
    var price = req.body.price;
    var datas = [idx, img, titlename, singer, price]; // 모든데이터를 배열로 묶기
    // var sql = `DELETE FROM cart WHERE (idx, titlename, singer) VALUES (?, ?, ?)`; // 업데이트 수정과 거의 비슷한 쿼리문
    var sql = `DELETE FROM cart WHERE idx = ? AND img = ? AND titlename = ? AND singer = ? AND price = ?`; // 업데이트 수정과 거의 비슷한 쿼리문
    // console.log(datas)
    connection.query(sql, datas, function(err, result){
        if(err) {console.error(err)};
        console.log(datas, 'deleted')
        res.redirect('/cartlist/cart');
    });
});

router.get('/buylist', function(req, res, next) {  //page/1 이 아니라  /page 로만 라우팅됫을때 /page/1 로 보내준다
    res.redirect('/cartlist/buylist/1');
});

router.get('/buylist/:buylist', function(req, res, next){ // 게시글 리스트에 :page가 추가된것임
    var buylist = req.params.buylist; // 현재 페이지는 params 을 req 요청받아옴
    var sql = "select idx, img, titlename, singer, price, date_format(regdate, '%Y-%m-%d') regdate from buylist";  // select 구절 그대로
    var userInfo = req.session.userInfo;
    connection.query(sql, function(err, rows){
        if (err) console.error("err : " + err);
        if(userInfo === undefined)
        res.render('buylist', {rows:rows, buylist:buylist, length:rows.length-1, buylist_num:10, pass:true, userInfo:0})
        else
        res.render('buylist', {rows:rows, buylist:buylist, length:rows.length-1, buylist_num:10, pass:true, userInfo:userInfo.name})
        // res.render('buylist', {rows:rows, cart:cart, length:rows.length-1, cart_num:10, pass:true, userInfo:userInfo.email}); 
        // length 데이터 전체넘버 랜더링,-1을 한이유는 db에서는1부터지만 for문에서는 0부터 시작 ,page_num: 한페이지에 보여줄 갯수
    });
});

router.post('/cart', function(req, res, next){
    var idx = req.body.idx;                  
    var img = req.body.img;                  
    var titlename = req.body.titlename;                  
    var singer = req.body.singer;
    var price = req.body.price
    var datas = [idx, img, titlename, singer, price]; // 모든데이터를 배열로 묶기
    // req 객체로 body 속성에서 input 파라미터 가져오기
    var sql = "insert into buylist(idx, img, titlename, singer, price) values(?,?,?,?,?)";  // ? 는 매개변수
    connection.query(sql, datas, function(err,rows){ // datas 를 매개변수로 추가
        if (err) console.error("err : " + err);
        res.redirect('/cartlist/buylist')
    });
    console.log(req.body);
});

module.exports = router;