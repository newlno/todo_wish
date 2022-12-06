const { ObjectId } = require("mongodb");

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
    if (req.user.userId == req.body.roomUser) {
      return res.send("me");
    } else {
      var chatData = {
        title: req.body.title,
        member: [req.body.roomUser, req.user.userId],
        date: new Date(),
      };
      req.app.db
        .collection("chatroom")
        .findOne(
          { title: chatData.title, member: chatData.member },
          (error, result) => {
            if (result) {
              return res.send("notnull");
            } else {
              req.app.db
                .collection("chatroom")
                .insertOne(chatData)
                .then((result) => {
                  return res.send(true);
                });
            }
          }
        );
    }
  };

  // 채팅방 삭제
  deleteRoom = (req, res) => {
    var deleteData = { _id: ObjectId(req.body.roomId) };
    req.app.db.collection("chatroom").deleteOne(deleteData, (error, result) => {
      if (result.deletedCount < 1) {
        return res.send("null");
      } else {
        var deleteData = { roomId: req.body.roomId };
        req.app.db
          .collection("message")
          .deleteMany(deleteData, (error, result) => {
            if (result.deletedCount < 1) {
              return res.send("null");
            }
          });
        return res.status(200).send(true);
      }
    });
  };

  // 채팅기록
  chatList = (req, res) => {
    var sort = { date: 1 };
    req.app.db
      .collection("message")
      .find({ roomId: req.body.roomId })
      .sort(sort)
      .toArray()
      .then((result) => {
        res.send(result);
      });
  };
}

module.exports = ChatController;
