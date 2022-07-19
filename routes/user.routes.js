const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const db = require('../models/index.js');
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/api/test/all", controller.allAccess);
  app.get(
    "/api/test/user",
    [authJwt.verifyToken, controller.nurseContent]
  );
  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin, controller.adminContent],
  );

  //Residents list
  app.get('/Residents',[authJwt.verifyToken,  function(req, res) {
    db.Residents.findAll({order: [['createdAt', 'DESC']]})
    .then(residentObjs => {
      res.render('residents', {
        residentObjs: residentObjs
      });
    })
  }]);
};