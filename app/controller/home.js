class HomeController {
  // 홈 화면
  home = (req, res) => {
    req.app.db
      .collection("post")
      .find()
      .toArray((error, result) => {
        console.log(result);
        if (!req.user) {
          res.render("posts.ejs", { posts: result, status: "none" });
        } else {
          res.render("posts.ejs", { posts: result, userId: req.user.userId });
        }
      });
  };

  // 검색기능
  search = (req, res) => {
    var searchCondition = [
      {
        $search: {
          index: "titleSearch",
          text: {
            query: req.query.value,
            path: "title",
          },
        },
      },
      { $project: { title: 1, _id: 0, score: { $meta: "searchScore" } } },
    ];
    console.log(req.query.value);
    req.app.db
      .collection("post")
      .aggregate(searchCondition)
      .toArray((error, result) => {
        console.log(result);
        res.render("search.ejs", { posts: result });
      });
  };
}

module.exports = HomeController;
