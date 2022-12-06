module.exports = (Server, http, app) => {
  // const express = require("express");
  // const app = express();
  const dayjs = require("dayjs");
  const io = new Server(http);

  io.on("connection", (socket) => {
    socket.on("joinRoom", (data) => {
      socket.join(data.roomId);
    });

    socket.on("userSend", (data) => {
      var resData = {
        roomId: data.roomId,
        message: data.message,
        userId: data.userId,
        date: dayjs().format("YYYY. MM. DD. HH:mm:ss"),
      };
      dbInsert(resData);
      io.to(data.roomId).emit("broadcast", resData);
    });
  });

  function dbInsert(resData) {
    app.db
      .collection("message")
      .insertOne(resData)
      .catch((error) => {
        console.error(error);
        return "error";
      });
  }
};

// SSE 몽고
// app.post("/message", loginCheck, (req, res) => {
//   var messageData = {
//     chatRoom: ObjectId(req.body.chatRoom),
//     content: req.body.content,
//     userId: req.user.userId,
//     date: new Date(),
//   };
//   db.collection("message")
//     .insertOne(messageData)
//     .then((result) => {
//       console.log("메시지저장 포스트요청 성공 ", result);
//     })
//     .catch((error) => {
//       console.error(error);
//       res.send("error");
//     });
// });

// app.get("/message/:id", loginCheck, (req, res) => {
//   res.writeHead(200, {
//     Connection: "keep-alive",
//     "Content-Type": "text/event-stream",
//     "Cache-Control": "no-cache",
//   });
//   db.collection("message")
//     .find({
//       chatRoom: ObjectId(req.params.id),
//     })
//     .toArray()
//     .then((result) => {
//       res.write("event: send\n");
//       res.write(`data:${JSON.stringify(result)}\n\n`);
//     });
//   const watchRoom = [
//     {
//       $match: { "fullDocument.chatRoom": ObjectId(req.params.id) },
//     },
//   ];
//   const changeStream = db.collection("message").watch(watchRoom);
//   changeStream.on("change", (result) => {
//     var newMessage = [result.FullDocument];
//     console.log(result);
//     console.log(result.FullDocument);
//     res.write("event: send\n");
//     res.write(`data:${JSON.stringify(newMessage)}\n\n`);
//   });
// });
