module.exports = (Server, http) => {
  const io = new Server(http);
  io.on("connection", (socket) => {
    console.log("소켓접속됨");

    socket.on("joinRoom", (data) => {
      console.log("서버조인", data);
      socket.join(data.roomId);
    });

    socket.on("userSend", (data) => {
      console.log(data.roomId + "에 보내기", data);
      console.log(data.message);
      var resData = {
        roomId: data.roomId,
        message: data.message,
        userId: data.userId,
      };
      io.to(data.roomId).emit("broadcast", resData);
    });
  });
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
