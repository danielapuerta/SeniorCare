const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail
    ],
    controller.signup
  );
  app.post("/api/auth/signin", controller.signin);

  //make a basic-user an admin (only admin can do this task)
    app.post("/api/makeAdmin", controller.makeAdmin);

  //make an admin a basic-user (only admin can do this task)
    app.post("/api/makeBasicUser", controller.makeBasicUser);

  //delete user (only admin can do this task)
    app.post("/api/deleteUser", controller.deleteUser);

};