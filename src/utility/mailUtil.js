const nodemailer = require('nodemailer');
const config = require('../config')

const option = {
    user: config.MAIL_USER,
    pass: config.MAIL_PASS
}

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: option.user,
        pass: option.pass,
    },
});

async function sendPassportMail(email, passport) {
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: option.user,
        to: email,
        subject: `[아아M] 회원가입 보안 코드 : ${passport}`,   // 제목
        text: 'passport',
        html: `<div style="text-align: center;"><h1>안녕하세요,</h1><br>귀하의 아아M 회원가입 요청이 접수되었습니다. <br>요청을 완료하려면 보안 대화 상자에 다음 인증 코드를 입력해주세요<br><br><b><div style="width: 160px; height: 30px; position: absolute; left: 42.5%;">인증코드 : ${passport}</b></div>
        <br>귀하가 보낸 요청이 아닌 경우 즉시 계정 비밀번호를 초기화 후 변경해 무단 엑세스를 방지하세요.<br><br><b>Copyright &copy; 2021 - ComeSinger<b></div>`,    // 내용
    });

    console.log(info)
}

async function sendPasswordMail(email, password) {
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: option.user,
        to: email,
        subject: '[아아M] 비밀번호 초기화에 성공하셨습니다.',     // 제목
        text: 'password',
        html: `<div style="text-align: center;"><h1>안녕하세요,</h1><br>귀하의 아아M 아이디의 비밀번호 초기화 요청이 접수되었습니다. <br>요청을 완료하려면 보안 대화 상자에 초기화된 비밀번호 코드를 입력해주세요<br><br><b><div style="width: 160px; height: 30px; position: absolute; left: 42.5%;">비밀번호 코드 : ${password}</b></div>
        <br>귀하가 보낸 요청이 아닌 경우 즉시 관리자에게 문의해 주시기 바랍니다.<br><br><b>Copyright &copy; 2021 - ComeSinger</b></div>`,   // 내용
    });

    console.log(info)
}

module.exports.sendPassportMail = sendPassportMail;
module.exports.sendPasswordMail = sendPasswordMail;
// https://velog.io/@npcode9194/NodeJS-nodemailer-%EB%AA%A8%EB%93%88%EC%9D%84-%EC%9D%B4%EC%9A%A9%ED%95%9C-Gmail-API-%EC%82%AC%EC%9A%A9-hhjwgcmhsh