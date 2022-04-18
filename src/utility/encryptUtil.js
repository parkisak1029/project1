const crypto = require("crypto");

// 비밀번호 암호화 저장 모듈
module.exports.encrypt = function (pwd) {
    let salt = crypto.createHash('SHA256').update('__WEB__', 'utf8', 'hex').digest('base64');
    let key = crypto.createHash('SHA256').update(pwd + salt, 'utf8', 'hex').digest('base64');

    return key;
}
