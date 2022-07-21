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

  //login 
  app.get('/', function(req, res) {
      res.render('login');
    });
  
  //register 
  app.get('/goToRegister', function(req, res) {
    res.writeHead(302, {location: '/register'});
    });
  
  app.get('/register', function(req, res) {
    res.render('register');
    });

  //Residents list
  app.get('/Residents',[authJwt.verifyToken, function(req, res) {
    let isAdmin = req.cookies['role'] == 'admin';
    db.Residents.findAll({order: [['createdAt', 'DESC']]})
    .then(residentObjs => {
      res.render('residents', {
        residentObjs: residentObjs,
        isAdmin: isAdmin
      });
    })
  }]);

  // Create new Resident
  app.post('/api/createResident', [ authJwt.verifyToken, authJwt.isAdmin,function(req, res) {
    const user = {
      "Name": req.body.Name,
      "age": req.body.age,
      "RoomNum": req.body.RoomNum
    };
    db.Residents.findOrCreate({where: {Name: user.Name, age: user.age, RoomNum: user.RoomNum}})
    .then(([residentObj, created]) => {
      res.status(200);
      res.send("Resident Created successfully");
    });
  }]);

  // view resident profile
  app.get('/ResidentProfile/:id', [authJwt.verifyToken, function(req, res) {

    db.Residents.findAll({where: { id:req.params.id},order: [['createdAt', 'DESC']], limit: 1})
    .then(residentObj => {
      var parsedResidentObject = residentObj[0].dataValues;
      db.BloodSugarLevels.findAll({order: [['createdAt', 'DESC']], limit: 5})
      .then((bloodSugarLevelObjs) => {
        console.log(bloodSugarLevelObjs);
        res.render('resident', {
          residentObj: parsedResidentObject,
          bloodSugarLevelObjs: bloodSugarLevelObjs
        });
      });
    })
  }]);

  //view nurse list
    app.get('/Nurses',[authJwt.verifyToken, function(req, res) {
      let isAdmin = req.cookies['role'] == 'admin';
      let notAdmin = req.cookies['role'] != 'admin';
      db.User.findAll({order: [['createdAt', 'DESC']]})
      .then(nurseObjs => {
        for(var i = 0; i < nurseObjs.length; i++){
          var nurse = nurseObjs[i];
          var roleNurse = nurse.dataValues.role;
          //adding a new column in datavalues object to check if it's admin
          var isNurseAdmin = roleNurse == "admin";
          nurse.dataValues.isAdmin = isNurseAdmin;
          //adding a new column in datavalues object to check if it's basic user
          var isNotNurseAdmin = roleNurse == "basic-user";
          nurse.dataValues.isNotAdmin = isNotNurseAdmin;
        };
        res.render('nurses', {
          nurseObjs: nurseObjs,
          isAdmin: isAdmin,
          notAdmin: notAdmin
        });
        
      })
    }]);


 //add blood sugar levels
  app.post('/api/addBloodSugarLevels', [ authJwt.verifyToken,function(req, res) {
    const patient = {
      "Levels": req.body.Levels,
      "PatientId": req.body.PatientId
    };
    db.BloodSugarLevels.create({PatientId: patient.PatientId, Levels: patient.Levels})
    .then(bloodSugarLevelsObj => {
      res.status(200);
      res.send(bloodSugarLevelsObj.dataValues);
    });
  }]);




};