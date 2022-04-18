var express = require('express');
var router = express.Router();
var mysql = require('mysql');  // db 폴더를 만들어서 conn 과 info 를 만들어 코드의 길이를 최대한줄일수도있다고한다
const session = require('express-session');
var userRouter = require('./user')
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



router.get('/write', function(req, res, next){  // board/write 로 접속하면 글쓰기페이지로 이동
    var userInfo = req.session.userInfo
    res.render('write', {title : "게시판 글쓰기", userInfo:userInfo.name})
});

router.post('/write', function(req, res, next){
    var name = req.body.name;                  
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [name, title, content, passwd]; // 모든데이터를 배열로 묶기
    // req 객체로 body 속성에서 input 파라미터 가져오기
    var sql = "insert into board(name, title, content, regdate, modidate, passwd,hit) values(?,?,?,now(),now(),?,0)";  // ? 는 매개변수
    connection.query(sql, datas, function(err,rows){ // datas 를 매개변수로 추가
        if (err) console.error("err : " + err);
        res.redirect('/board/page')
    });
});

router.get('/page', function(req, res, next) {  //page/1 이 아니라  /page 로만 라우팅됫을때 /page/1 로 보내준다
        res.redirect('/board/page/1');
});
router.get('/page/:page', function(req, res, next){ // 게시글 리스트에 :page가 추가된것임
    var page = req.params.page; // 현재 페이지는 params 을 req 요청받아옴
    var userInfo = req.session.userInfo
    var sql =  "select idx, name, title, date_format(modidate,'%Y-%m-%d') modidate, " +
    "date_format(regdate,'%Y-%m-%d') regdate from board";  // select 구절 그대로
    connection.query(sql, function(err, rows){
        if (err) console.error("err : " + err);
        if(userInfo === undefined)
        res.render('page', {title : '글목록', rows:rows, page:page, length:rows.length-1, page_num:10, pass:true, userInfo:0});  
        else
        res.render('page', {title : '글목록', rows:rows, page:page, length:rows.length-1, page_num:10, pass:true, userInfo:userInfo.name});
        // length 데이터 전체넘버 랜더링,-1을 한이유는 db에서는1부터지만 for문에서는 0부터 시작 ,page_num: 한페이지에 보여줄 갯수
    });
});

router.get('/read/:idx', function(req, res, next){ // board/read/idx숫자 형식으로 받을거
    var idx = req.params.idx; // :idx 로 맵핑할 req 값을 가져온다
    var userInfo = req.session.userInfo
    var sql = "SELECT idx, name, title, content, date_format(modidate, '%Y-%m-%d') modidate, " +   
    "date_format(regdate,'%Y-%m-%d') regdate, hit from board where idx=?";
    connection.query(sql, [idx], function(err, rows){  // 한개의 글만조회하기때문에 마지막idx에 매개변수를 받는다
        if(err) console.error("err : " + err);
        if(userInfo === undefined)
        res.render('read', {title : '글 상세보기', rows:rows[0], userInfo:0}); // 첫번째행 한개의데이터만 랜더링 요청   
        else 
        res.render('read', {title : '글 상세보기', rows:rows[0], userInfo:userInfo.name});
    });
});


router.post('/update', function(req, res, next){
    var idx = req.body.idx;
    var name = req.body.name;
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [name, title, content, idx, passwd]; // 변수설정한 값을 datas 에 배열화
    var sql = "UPDATE board set name=?, title=?, content=? ,modidate=now() where idx=? and pass wd=?"; // id 값과 비밀번호를 조건절로 걸엇음
    connection.query(sql, datas, function(err, result){ 
        if (err) console.error(err);
        if(result.affectedRows == 0) //affectedRows  해당쿼리로 변경된수의 행 불러오기 0이면 업데이트 되지않으므로 비밀번호가 틀린것임
        { res.send("<script>alert('비밀번호가 일치하지않습니다');history.back();</script>")
        } 
        else {
            // res.redirect('/board/read/' + idx);
            res.redirect('/board/page');
        }
    });
});



router.post('/delete', function(req,res,next){
    var idx = req.body.idx;
    var passwd = req.body.passwd;
    var datas = [idx, passwd];
    var sql = "delete from board where idx=? and passwd=?"; // 업데이트 수정과 거의 비슷한 쿼리문
    connection.query(sql, datas, function(err, result){
        if(err) console.error(err);
        if(result.affectedRows == 0){
            res.send("<script>alert('패스워드가 일치하지 않습니다.');history.back();</script>");
        } else {
            res.redirect('/board/page');
        }
    });
});
// 삭제기능은 수정기능과 거의 비슷함 

router.get('/contact', function(req, res, next){ // 게시글 리스트에 :page가 추가된것임
    var contact = req.params.contact; // 현재 페이지는 params 을 req 요청받아옴
    var sql =  "select id, email, name from users ";  // select 구절 그대로
    var userInfo = req.session.userInfo;
    // var count = "SELECT * FROM users";
    // connection.query(count, (err, result, fields) =>{
    // if (err) throw err;

    // var count1 = result.length;
    // console.log(count1);
        connection.query(sql, function(err, result, fields){ //원래 rows 있었는데 삭제함.
            if (err) console.error("err : " + err);

            if(userInfo === undefined)
            res.render('contact', {title : '글 상세보기',result:result, contact:contact, pass:true, result : '', userInfo:0}); // 첫번째행 한개의데이터만 랜더링 요청   
            else 
            res.render('contact', {title : '글 상세보기', result:result, contact:contact, pass:true, result : '', userInfo:userInfo.name});

            // res.render('contact', {result:result, contact:contact, pass:true, result : ''}); 
        });   //result:result 가 있어야 result를 읽는다.
    }); //왜 검색하는데 get 이 나오내ㅑ??? //post와 get을 따로 작동하는 방법...?

router.post("/contact", (req, res) => {      ///search로 다른 웹에다가 띄우기.
    
    var userInfo = req.session.userInfo;
    // let VS = 'taesu'; //데이터베이스의 userid
    // let VS = req.body.search; //데이터베이스의 userid
    console.log(req.body.searchid);
    // const sql = "SELECT userid FROM class4 where userid Like %"+req.body.search+"%"; //value값이 들어간 sql 
    const sql = `SELECT * FROM users where name Like '%${req.body.searchid}%'`; //value값이 들어간 sql 
    // const sql = "SELECT userid FROM class4 where userid Like '%" +VS+"%'"; //value값이 들어간 sql 
    // const sql = "SELECT userid FROM class4 where userid Like '%ae%'"; //sql 테이블 class4를 가져옴. 
    console.log(sql);
    try { //시도하다 시스템에걸려지는 에러들  이프가 거는건 내가 if로 처리한다. 
        // rows.query((err, connection) => {
        //     console.log("connection_pool GET");
        //     if(err) throw err;
       
            connection.query(sql, (err, result, fields) => { //커넥션에서 에러가났다 (에러코드가 서버가 터지거나..)
                if(err) {
                    console.error("connection_pool GET Error / " + err); //에러가 났으면 콘솔에 이런 메세지
                    res.status(500).send("message : Internal Server Error");
                } else {
                  if(req.body.searchid == ''){
                    // res.send(`<script>alert('no value in searchbox');</script>`);

                    if(userInfo === undefined)
                    res.render('contact', {result : '', userInfo:0}); // 첫번째행 한개의데이터만 랜더링 요청   
                    else 
                    res.render('contact', {result : '', userInfo:userInfo.name});
                    // let msg = "hi";
                    
                    //    res.render('contact', {result : ''}); (userinfo 받기전)
                        // 여기서 시작 
                // res.send(`<script>alert('no value in searchbox');window.location.href='/board/contact';</script>`);
                // res.send(`<script>alert('no value in searchbox');location.href=document.referrer;</script>`);
                
                        
                  }
                  else if(result.length === 0){ //테이블에 든게 없다라면

                    if(userInfo === undefined)
                    res.render('contact', {result : '', userInfo:0}); // 첫번째행 한개의데이터만 랜더링 요청   
                    else 
                    res.render('contact', {result : '', userInfo:userInfo.name});
                       
                        // res.send("<script>alert('no result');location.href=document.referrer;</script>");
                        // res.render('contact', {result : ''});     (userinfo 받기전)
                        // res.render('contact');
                        // res.status(400).send({
                        //     success : false,
                        //     message : "DB response Not Found"  
                        // })
                        console.log("오류네");
                    } else {

                        if(userInfo === undefined)
                        

                    res.render('contact', {result: result[0].name +" / "+ result[0].banknum, userInfo:0}); // 첫번째행 한개의데이터만 랜더링 요청   
                    else 
                    res.render('contact', {result: result[0].name +" / "+ result[0].banknum, userInfo:userInfo.name});
                        // console.log("여기까지");
                        // res.send(result);
                        // console.log(result[0].idx)
                        // res.render('contact', {result: result[0].name +" / "+ result[0].email, userInfo:userInfo.email}); (userinfo 받기전)
                        // res.redirect('contact');
                        // res.render('/contact', {message:result});
                              //찍고싶었던 값
                            // success : true,
                            // valSearch :  valSearch      // 브라우저에서 사용 : 서버에서 사용
                           
                    };
                };
                // connection.relsease();   
            });
                       //connection pool 에서 사용하다가 반납
        // })
    } catch (err) { // 첫 try에서 에러나는 부분은 이리로 온다.
        console.error("connection_pool GET Error / " + err);
        res.status(500).send("message : Internal Server Error");
    }
});

module.exports = router;