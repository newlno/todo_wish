require("dotenv").config();

var checkMail =
  /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

var checkId = /^(?=.*[a-z])(?=.*[0-9])[a-z0-9]{4,12}$/;
var checkPw =
  /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/;

// 정규식 검증
const check = {
  checkMail(parma) {
    if (!parma.match(checkMail)) {
      return false;
    } else {
      return true;
    }
  },
  checkId(parma) {
    if (!parma.match(checkId)) {
      return false;
    } else {
      return true;
    }
  },
  checkPw(parma) {
    if (!parma.match(checkPw)) {
      return false;
    } else {
      return true;
    }
  },
};

// 로그인 검증
const loginCheck = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.send(
      "<script>alert('로그인이 필요합니다.'); window.location.replace('/user/login');</script>"
    );
  }
};
module.exports = { check, loginCheck };
