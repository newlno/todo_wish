const dayjs = require("dayjs");

class PostController {
  // 글 작성 페이지 진입
  writePage = (req, res) => {
    res.render("write.ejs");
  };

  // 글 수정 페이지 진입
  editPage = (req, res) => {
    req.app.db
      .collection("post")
      .findOne(
        { _id: parseInt(req.params.id), userPk: req.user._id },
        (error, result) => {
          if (result == null) {
            res.send(
              "<script>alert('작성자만 수정이 가능합니다.'); window.location.replace('/');</script>"
            );
          } else {
            result.price = result.price.replace(/,/g, "");
            res.render("edit.ejs", {
              post: result,
            });
          }
        }
      );
  };

  // 글 수정하기
  editPost = (req, res) => {
    if (
      !req.body.title ||
      !req.body.price ||
      !req.body.type ||
      !req.body.content
    ) {
      return res.send("null");
    }
    req.app.db.collection("post").updateOne(
      { _id: parseInt(req.params.id) },
      {
        $set: {
          title: req.body.title,
          price: String(req.body.price).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          content: req.body.content,
          image: req.body.image,
          date: dayjs().format("YYYY. MM. DD"),
          type: req.body.type,
        },
      },
      (error, result) => {
        if (error) {
          return console.error(error);
        }
        return res.send(true);
      }
    );
  };

  // 글 상세보기
  detailPage = (req, res) => {
    req.app.db
      .collection("post")
      .findOne({ _id: parseInt(req.params.id) }, (error, result) => {
        res.render("detail.ejs", { post: result });
      });
  };

  // 글 작성
  createPost = (req, res) => {
    if (
      !req.body.title ||
      !req.body.price ||
      !req.body.type ||
      !req.body.content
    ) {
      return res.send(
        "<script>alert('모든 값을 입력해주세요.'); window.location.replace('/posts');</script>"
      );
    }
    req.app.db
      .collection("counter")
      .findOne({ name: "postCount" }, (error, result) => {
        var price = req.body.price;
        var count = parseInt(result.totalPost);
        req.app.db.collection("post").insertOne({
          _id: count + 1,
          title: req.body.title,
          price: String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          content: req.body.content,
          image: req.body.image,
          date: dayjs().format("YYYY. MM. DD"),
          type: req.body.type,
          userPk: req.user._id,
          userId: req.user.userId,
        });
        req.app.db
          .collection("counter")
          .updateOne(
            { name: "postCount" },
            { $inc: { totalPost: 1 } },
            (error, result) => {
              if (error) {
                console.error(error);
                return process.exit();
              }
            }
          );
      });
  };

  // 글 삭제
  deletePost = (req, res) => {
    req.body._id = parseInt(req.body._id);
    var deleteData = { _id: req.body._id, userPk: req.user._id };
    req.app.db.collection("post").deleteOne(deleteData, (error, result) => {
      if (result.deletedCount < 1) {
        res.send("different user");
      } else {
        res.status(200).send(true);
      }
    });
  };

  // 이미지 업로드
  imageUpload = async (req, res) => {
    if (!req.file) {
      return res.send(false);
    }
    const filePath = req.file.location;
    if (!filePath) {
      throw new CustomError({
        status: 401,
        Response: {
          message: "Invalid file path",
        },
      });
    }
    res.send(req.file.location);
  };
}

module.exports = PostController;
