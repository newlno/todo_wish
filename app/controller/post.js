class PostController {
  // 글 작성 페이지 진입
  writePage = (req, res) => {
    res.render("write.ejs");
  };

  // 글 수정 페이지 진입
  editPage = (req, res) => {
    req.app.db
      .collection("post")
      .findOne({ _id: parseInt(req.params.id) }, (error, result) => {
        res.render("edit.ejs", { post: result });
        console.log(result);
      });
  };

  // 글 수정하기
  editPost = (req, res) => {
    req.app.db
      .collection("post")
      .updateOne(
        { _id: parseInt(req.params.id) },
        { $set: { title: req.body.title, day: req.body.day } },
        (error, result) => {
          if (error) {
            return console.error(error);
          }
          res.redirect("/posts");
          console.log("수정완료" + result);
        }
      );
  };

  // 글 상세보기
  detailPage = (req, res) => {
    req.app.db
      .collection("post")
      .findOne({ _id: parseInt(req.params.id) }, (error, result) => {
        res.render("detail.ejs", { post: result });
        console.log(result);
      });
  };

  // 글 작성
  createPost = (req, res) => {
    console.log(req.body);
    req.app.db
      .collection("counter")
      .findOne({ name: "postCount" }, (error, result) => {
        console.log("현재 총 게시물 갯수 : " + result.totalPost);
        var count = parseInt(result.totalPost);
        req.app.db.collection("post").insertOne(
          {
            _id: count + 1,
            title: req.body.title,
            day: req.body.day,
            userPk: req.user._id,
            userId: req.user.userId,
          },
          (req, res) => {
            console.log("저장완료");
            req.app.db
              .collection("counter")
              .updateOne(
                { name: "postCount" },
                { $inc: { totalPost: 1 } },
                (error, result) => {
                  console.log("저장 후 총 게시물 갯수 : " + (count + 1));
                  if (error) {
                    console.error(error);
                    return process.exit();
                  }
                }
              );
          }
        );
        res.send("게시물 작성 완료됨");
      });
  };

  // 글 삭제
  deletePost = (req, res) => {
    console.log("삭제요청", req.body);
    console.log(req.user._id);
    req.body._id = parseInt(req.body._id);
    var deleteData = { _id: req.body._id, userPk: req.user._id };
    req.app.db.collection("post").deleteOne(deleteData, (error, result) => {
      if (result.deletedCount <= 1) {
        res.send("different user");
      } else {
        console.log("삭제완료");
        console.log(result);
        res.status(200).send({ message: "삭제 성공했습니다." });
      }
    });
  };
}

module.exports = PostController;
