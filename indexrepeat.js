const express = require("express");
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const host = "127.0.0.1";
const port = 3000;

app.use(express.static('views'))

app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json());

app.set('view engine', 'pug');
app.set('views', './src/views');

var connection = mysql.createConnection({ // createConnection 데이터베이스 설정 입력 
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : 'quswjdgus1!',
    database : 'project'
});

connection.connect(function(req, res, err) { // connect 함수로 접속과 동시에 연결설정에 대한 확인 
    if(err) {
        
        console.error(err);
        throw err;
    } else {
        console.log('success');
    }
});

// connection.end();

app.get('/', (req, res) => {
    res.render('form.pug')
});

 app.post('/form.pug', (req, res) => {
    const sql = "SELECT * FROM new_Table";
     var name = req.body.name
     var datas = [name];
     sql.connection(sql, datas, (err, result) => {
         if(err) throw err;
        if(result == name) {
            res.render('form', `${name}`);
        }else {
            res.send("<script>alert('존재하는 작곡가가 없습니다')</script>")
        }   
     });

 });

app.listen(port, host, () => {
    console.log(`Application server running at http://${host}:${port}/`);
});