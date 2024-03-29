const { verifySignUp } = require("../middleware");
const { authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //register
  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateNurseCode],
    controller.signup
  );

  //login
  app.post("/api/auth/signin", controller.signin);

  // Create new Resident
  app.post("/api/createResident", authJwt.verifyToken, authJwt.isAdmin, controller.createResident);

  //view nurse list
  app.get("/Nurses", authJwt.verifyToken, controller.Nurses);

  //make a basic-user an admin (only admin can do this task)
  app.post("/api/makeAdmin", controller.makeAdmin);

  //make an admin a basic-user (only admin can do this task)
  app.post("/api/makeBasicUser", controller.makeBasicUser);

  //delete user (only admin can do this task)
  app.post("/api/deleteUser", controller.deleteUser);

 

};
