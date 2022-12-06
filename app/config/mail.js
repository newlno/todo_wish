require("dotenv").config();
const mailer = require("nodemailer");
const mailAddress = process.env.MAILADDRESS;
const mailPassword = process.env.MAILPASSWORD;

let mail = {
  snedMail(param, authNum) {
    const email = {
      host: "smtp.naver.com",
      post: 465,
      secure: false,
      auth: {
        user: mailAddress,
        pass: mailPassword,
      },
    };
    const content = {
      from: "todowish@naver.com",
      to: param.body.email,
      subject: "[todo_wish] 회원가입 인증메일",
      text: `아래 인증번호를 확인하여 이메일 주소 인증을 완료해 주세요.\n
              가입하신 이메일 👉 ${param.body.email}\n
              인증번호 6자리 👉 ${authNum}`,
    };

    const send = async (data) => {
      mailer.createTransport(email).sendMail(data, function (error, info) {
        if (error) {
          console.error(error);
        } else {
          return info.response;
        }
      });
    };
    send(content);
  },
};
module.exports = mail;
