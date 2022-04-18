const express = require('express');
const router = express.Router();
const encryptUtil = require('../utility/encryptUtil')
const dbUtil = require('../utility/dbUtil')
const mailUtil = require('../utility/mailUtil')

// 랜덤 인증번호 생성
function getRandomPassport(number) {

    let getRandomNumber = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
    }

    let passport = ''
    for (let i = 0; i < number; i++) {
        passport += getRandomNumber(0, 10).toString()
    }

    return passport
}

// 이메일 형식 인증
function validateEmail(value) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(value);
}

// 로그아웃
const logoutHandle = (req, res) => {
    // 세션 삭제
    req.session.destroy();
    // 메인화면 이동
    return res.send({
        result: true,
        message: ''
    });
}

// 이메일 인증
const passportHandler = (req, res) => {
    // 데이터 가져오기
    const {email, passport} = JSON.parse(JSON.stringify(req.body))

    // 사용자 검색 쿼리
    let sql = 'SELECT * FROM users WHERE email = ?';
    dbUtil.getConnection((db) => {
        db.query(sql, [email], (error, results, fields) => {
            if (error) {
                return res.send({
                    result: false,
                    message: 'Internal Server Error1'
                });
            }
            // 인증번호 일치 여부
            if (results[0].passport !== passport) {
                return res.send({
                    result: false,
                    message: '인증번호가 일치하지 않습니다.'
                });
            }

            const active = 1
            sql = 'UPDATE users SET active = ? WHERE email = ?'
            dbUtil.getConnection((db) => {
                db.query(sql, [active, email], (error, results, fields) => {
                    if (error) {
                        return res.send({
                            result: false,
                            message: 'Internal Server Error2'
                        });
                    }

                    // 정상 추가
                    return res.send({
                        result: true,
                        message: ''
                    });
                });

                db.release();
            });
        });
        db.release();
    });
}

// 비밀번호 초기화 및 메일 발송
const initHandler = (req, res) =>{

    // 데이터 가져오기
    const {email} = JSON.parse(JSON.stringify(req.body))

    // 데이터 검사
    if (email === undefined || email === '') {
        return res.send({
            result: false,
            message: '이메일이 입력되지 않았습니다.'
        });
    }
    
    // 이메일 형식 검사
    if (validateEmail(email) === false) {
        return res.send({
            result: false,
            message: '이메일 형식이 아닙니다.'
        });
    }

    // 사용자 검색 쿼리
    let sql = 'SELECT * FROM users WHERE email = ?';
    dbUtil.getConnection((db) => {
        db.query(sql, [email], (error, results, fields) => {
            if (error) {
                return res.send({
                    result: false,
                    message: 'Internal Server Error3'
                });
            }

            // 등록된 이메일이 아닌 경우
            if (results.length === 0) {
                return res.send({
                    result: false,
                    message: '등록된 사용자(E-mail)가 없습니다.'
                });
            }

            // 비밀번호 초기화
            const password =  getRandomPassport(8)
            
            sql = 'UPDATE users SET password = ? WHERE email = ?'
            dbUtil.getConnection((db) => {
                db.query(sql, [encryptUtil.encrypt(password) , email], (error, results, fields) => {
                    if (error) {
                        return res.send({
                            result: false,
                            message: 'Internal Server Error4'
                        });
                    }

                    // 이메일 전송
                    mailUtil.sendPasswordMail(email, password);
                    
                    // 정상 업데이트
                    return res.send({
                        result: true,
                        message: ''
                    });
                });

                db.release();
            });
        });
        db.release();
    });
    
}

// 회원가입 수행합니다.
const signUpHandler = (req, res) => {
    // 데이터 가져오기
    const {email, password1, password2, name, banknum} = JSON.parse(JSON.stringify(req.body))

    // 데이터 검사
    if (email === undefined || email === ''
        || password1 === undefined || password1 === ''
        || password2 === undefined || password2 === ''
        || name === undefined || name === '') {
        return res.send({
            result: false,
            message: '회원정보가 입력되지 않아서 회원가입을 할 수 없습니다.'
        });
    }

    // 비밀번호 일치 여부 확인
    if (password1 !== password2) {
        return res.send({
            result: false,
            message: '비밀번호가 일치하지 않습니다.'
        });
    }

    // 이메일 형식 검사
    if (validateEmail(email) === false) {
        return res.send({
            result: false,
            message: '이메일 형식이 아닙니다.'
        });
    }

    // 사용자 검색 쿼리
    let sql = 'SELECT * FROM users WHERE email = ?';
    dbUtil.getConnection((db) => {
        db.query(sql, [email], (error, results, fields) => {
            if (error) {
                return res.send({
                    result: false,
                    message: 'Internal Server Error5'
                });
            }

            // 이미 등록된 이메일이 있는 경우
            if (results.length === 1) {
                return res.send({
                    result: false,
                    message: '이미 등록된 사용자(E-mail)이 있습니다.'
                });
            }

            // db insert 쿼리
            const passport = getRandomPassport(6)
            const active = 0
            sql = 'INSERT INTO users (email, name, password, active, passport, banknum) VALUES (?, ?, ?, ?, ?, ?)'
            dbUtil.getConnection((db) => {
                db.query(sql, [email, name, encryptUtil.encrypt(password1), active, passport, banknum], (error, results, fields) => {
                    if (error) {
                        return res.send({
                            result: false,
                            message: 'Internal Server Error6'
                        });
                    }

                    // 이메일 전송
                    mailUtil.sendPassportMail(email, passport);
                    
                    // 정상 추가
                    return res.send({
                        result: true,
                        message: ''
                    });
                });

                db.release();
            });

        });
        db.release();
    });
}

// 로그인 수행합니다. (사용자인증처리)
const loginHandler = (req, res) => {
    // 데이터 가져오기
    const {email, password} = JSON.parse(JSON.stringify(req.body))

    // 데이터 검사
    if (email === undefined || email === '') {
        return res.send({
            result: false,
            message: '아이디가 입력되지 않아서 로그인 할 수 없습니다.'
        });
    }

    // 사용자 검색 쿼리
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    dbUtil.getConnection((db) => {
        db.query(sql, [email, encryptUtil.encrypt(password)], (error, results, fields) => {
            if (error) {
                return res.send({
                    result: false,
                    message: 'Internal Server Error7'
                });
            }

            // select 조회결과가 없는 경우 (즉, 등록계정이 없는 경우)
            if (results.length === 0) {
                return res.send({
                    result: false,
                    message: '사용자 정보가 없습니다.'
                });
            }

            // 계정활성화 여부
            if (results[0].active === 0) {
                return res.send({
                    result: false,
                    message: '이메일 인증을 해주세요.'
                });
            }

            // select 조회결과가 있는 경우 (즉, 등록사용자인 경우)
            const email = results[0].email;
            const name = results[0].name;
            const who = 'app'
            // 로그인 사용자 정보 세션 저장
            req.session.userInfo = {
                email, name, who
            }

            res.send({
                result: true,
                message: ''
            })
        });

        db.release();
    });

}

// REST API의 URI와 핸들러를 매핑합니다.
router.post('/login', loginHandler); // 로그인
router.post('/signUp', signUpHandler); // 회원가입
router.post('/init', initHandler); // 비밀번호 초기화
router.post('/passport', passportHandler); // 인증
router.post('/logout', logoutHandle); // 로그아웃

module.exports = router;