class ChatController {
  // 채팅 페이지 진입
  chatPage = (req, res) => {
    req.app.db
      .collection("chatroom")
      .find({ member: req.user.userId })
      .toArray()
      .then((result) => {
        res.render("chat.ejs", { data: result, userId: req.user.userId });
      });
  };

  // 채팅방 생성
  createRoom = (req, res) => {
    console.log("서버챗타이틀", req.body.title);
    var chatData = {
      title: req.body.title,
      member: [req.body.roomUser, req.user.userId],
      date: new Date(),
    };
    console.log("여기 오나요?");
    req.app.db
      .collection("chatroom")
      .insertOne(chatData)
      .then((result) => {
        console.log(result);
        res.redirect("/chat");
      });
  };
}

module.exports = ChatController;
