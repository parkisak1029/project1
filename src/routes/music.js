var express = require('express');
var router = express.Router();
var mysql = require('mysql');  // db 폴더를 만들어서 conn 과 info 를 만들어 코드의 길이를 최대한줄일수도있다고한다
const session = require('express-session');
var userRouter = require('./user')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { route } = require('./user');
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

router.get('/uploadmusic', function(req, res, next){  // board/write 로 접속하면 글쓰기페이지로 이동
    res.render('uploadmusic', {title : "음악 업로드"})
});

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
  },
});

var upload = multer({ storage: storage });

router.post('/uploadmusic', upload.single('mp3'), function(req, res, next){
    var tn = req.body.titlename;
    var singer = req.body.singer;
    var img = `/uploads/cd.jpg`;
    var mp3 = `/uploads/${req.file.filename}`;
    var passwod = req.body.passwod;
    var price = req.body.price;
    var datas = [tn, singer, img,mp3, passwod, price]; // 모든데이터를 배열로 묶기
    // req 객체로 body 속성에서 input 파라미터 가져오기
    console.log(datas)
    var sql = "insert into music(titlename, singer, img,mp3, passwod, hit, price) values(?,?,?,?,?, 0, ?);";  // ? 는 매개변수
    connection.query(sql, datas, function(err,rows){ // datas 를 매개변수로 추가
        if (err) {
        console.error("err : " + err);
        } else{
        console.log("rows: " + JSON.stringify(rows));
        res.redirect('/music/selling/1')
        }
    });
});

router.get('/selling', function(req, res, next) {  //page/1 이 아니라  /page 로만 라우팅됫을때 /page/1 로 보내준다
        res.redirect('/music/selling/1');
});
router.get('/selling/:selling', function(req, res, next){ // 게시글 리스트에 :page가 추가된것임
    var selling = req.params.selling; // 현재 페이지는 params 을 req 요청받아옴
    var userInfo = req.session.userInfo
    var sql =  "select idx, titlename, singer, img, mp3, seal," +
    "passwod, hit, price from music;";  // select 구절 그대로
    connection.query(sql, function(err, rows){
        if (err) console.error("err : " + err);
        if(userInfo == undefined)
        res.render('selling', {title : '글목록', rows:rows, selling:selling, length:rows.length-1, selling_num:4, pass:true, userInfo:0});  
        else
        res.render('selling', {title : '글목록', rows:rows, selling:selling, length:rows.length-1, selling_num:4, pass:true, userInfo:userInfo.name});
        // length 데이터 전체넘버 랜더링,-1을 한이유는 db에서는1부터지만 for문에서는 0부터 시작 ,page_num: 한페이지에 보여줄 갯수
    });
});


router.post('/delete', function(req,res,next){
    var idx = req.body.idx;
    var passwod = req.body.passwod;
    var datas = [idx, passwod];
    var sql = "delete from board where idx=? and passwd=?;"; // 업데이트 수정과 거의 비슷한 쿼리문
    connection.query(sql, datas, function(err, result){
        if(err) console.error(err);
        if(result.affectedRows == 0){
            res.send("<script>alert('암호가 일치하지 않습니다.');history.back();</script>");
        } else {
            res.redirect('/music/selling');
        }
    });
});



// 삭제기능은 수정기능과 거의 비슷함 
module.exports = router;