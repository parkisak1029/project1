const mysql = require('mysql');
const config = require('../config')

const options = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
};

let pool = mysql.createPool(options);

function getConnection(callback) {
    pool.getConnection(function (err, conn) {
        if (!err) {
            callback(conn);
        }
    });
}

// 사용자 테이블 만들기
function createUserDB() {
    let sql = `
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`email\` varchar(255) DEFAULT NULL,
      \`name\` varchar(255) DEFAULT NULL,
      \`password\` varchar(255) DEFAULT NULL,
      \`active\` INT NOT NULL DEFAULT 0,
      \`passport\` varchar(255) DEFAULT NULL,
      \`banknum\` varchar(255) DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`name_UNIQUE\` (\`email\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
`
    getConnection((db) => {
        db.query(sql, (err, results, fields) => {
            if (err) {
                console.log(err)
            }
        });

        db.release();
    });
}

createUserDB();

module.exports.getConnection = getConnection;