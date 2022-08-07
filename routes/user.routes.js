const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const db = require("../models/index.js");

/* Algorithm to create priority*/
function createPriority(id) {
  //create promises that store the get functions
  let promise_latest_blood_sugar_levels = get_latest_blood_sugar_levels(id);
  let promise_latest_temperature = get_latest_body_temperature(id);
  let promise_daily_falls_count = get_daily_number_falls(id);
  let promise_weekly_falls_count = get_weekly_number_falls(id);
  let promise_monthly_falls_count = get_monthly_number_falls(id);

  //create score board points for Falls
  let iPointsDaily = 3;
  let iPointsWeekly = 2;
  let iPointsMonthly = 1;

  //create score board points for Body Temperature and Blood Sugar Levels
  let iPointsHigh = 10;
  let iPointsMedium = 5;

  //var for total number of points
  let iTotalNumberOfPoints = 0;

  //create an array of Promises
  const allPromises = [
    promise_latest_blood_sugar_levels, //aValues[0]
    promise_latest_temperature, //aValues[1]
    promise_daily_falls_count, //aValues[2]
    promise_weekly_falls_count, //aValues[3]
    promise_monthly_falls_count //aValues[4]
  ];

  //use Promises data values and create score board
  Promise.all(allPromises).then((aValues) => {
    //accesing to the vaues of the array of Promises
    let iBloodSugarLevels = aValues[0];
    let iBodyTemperature = aValues[1];
    let iDailyFalls = aValues[2];
    let iWeeklyFalls = aValues[3];
    let iMonthlyFalls = aValues[4];
    let iTotalFalls = iDailyFalls + iWeeklyFalls + iMonthlyFalls;
    let iTotalFallPoints = 0;

    iTotalFallPoints += (iDailyFalls * iPointsDaily);
    iTotalFallPoints += (iWeeklyFalls * iPointsWeekly);
    iTotalFallPoints += (iMonthlyFalls * iPointsMonthly);

    iTotalNumberOfPoints = parseInt(iTotalFallPoints/iTotalFalls);

    
    
    if(iBodyTemperature != 'Row not found'){
      if(iBodyTemperature <=33 || iBodyTemperature >= 38){//high
        iTotalNumberOfPoints += iPointsHigh; 
        console.log('High Priority' + iTotalNumberOfPoints);
      }else if((iBodyTemperature >=34 || iBodyTemperature <=37) && (iBodyTemperature <35 && iBodyTemperature >36)){//medium
        iTotalNumberOfPoints += iPointsMedium; 
        console.log('Medium Priority' + iTotalNumberOfPoints);
      }
    }
 
    //based on non diabetic people at the moment
    if(iBloodSugarLevels  != 'Row not found'){
        console.log('placeholder for sugar points code');
      if(iBloodSugarLevels <= 50 || iBloodSugarLevels >= 180 ){ //high
        iTotalNumberOfPoints += iPointsHigh;
      }else if( (iBloodSugarLevels >=51 && iBloodSugarLevels < 90) || (iBloodSugarLevels  <= 179 && iBloodSugarLevels > 150 )){ //medium
        iTotalNumberOfPoints += iPointsMedium;
      }
    }

    db.Residents.update({priority: iTotalNumberOfPoints}, {where: {id : id}} )

  });

}//end of createPriority function

//function to get daily number of fall per resident
function get_daily_number_falls(id) {
  const moment = require("moment");
  const Op = require("sequelize").Op;
  const promise_count_daily = new Promise((resolve, reject) => {
    db.Falls.count({
      where: {
        PatientId: id,
        DateTime_Fall: {
          [Op.between]: [
            moment().format("YYYY-MM-DD 00:00"),
            moment().format("YYYY-MM-DD 23:59"),
          ],
        },
      },
    }).then((count_daily_falls) => {
      resolve(count_daily_falls);
    });
  });
  return promise_count_daily;
}

//function to get weekly number of fall per resident
function get_weekly_number_falls(id) {
  const Op = require("sequelize").Op;
  const today = new Date();
  const week = 1000 * 60 * 60 * 24 * 7; //week in milliseconds
  const today_minus_7_days = new Date(today.getTime() - week);

  const promise_count_weekly = new Promise((resolve, reject) => {
    db.Falls.count({
      where: {
        PatientId: id,
        DateTime_Fall: { [Op.between]: [today_minus_7_days, today] },
      },
    }).then((count_weekly_falls) => {
      resolve(count_weekly_falls);
    });
  });
  return promise_count_weekly;
}

//function to get monthly number of fall per resident
function get_monthly_number_falls(id) {
  const Op = require("sequelize").Op;
  const today = new Date();
  const month = 1000 * 60 * 60 * 24 * 30; //months in milliseconds, 30 days as example
  const today_minus_30_days = new Date(today.getTime() - month);

  const promise_count_monthly = new Promise((resolve, reject) => {
    db.Falls.count({
      where: {
        PatientId: id,
        DateTime_Fall: { [Op.between]: [today_minus_30_days, today] },
      },
    }).then((count_monthly_falls) => {
      resolve(count_monthly_falls);
    });
  });
  return promise_count_monthly;
}

//function to get the lastest body temperature per resident
function get_latest_body_temperature(id) {
  const oPromiseLatestTemperature = new Promise((resolve, reject) => {
    db.BodyTemperature.findAll({
      where: {PatientId: id},
      order: [["createdAt", "DESC"]], 
      limit: 1,
    }).then((aLatestTemperature) => {
      if(aLatestTemperature.length == 0){
        resolve("Row not found");
      }else{
        resolve(aLatestTemperature[0].dataValues.BodyTemperature);
      }
    });
  });
  return oPromiseLatestTemperature;
}

//function to get the lastest blood sugar levels per resident
function get_latest_blood_sugar_levels(id) {
  const oPromiseLatestBSLevels = new Promise((resolve, reject) => {
    db.BloodSugarLevels.findAll({
      where: {PatientId: id},
      order: [["createdAt", "DESC"]], 
      limit: 1,
    }).then((aLatestBSL) => {
      if(aLatestBSL.length == 0){
        resolve("Row not found");
      }else{
        resolve(aLatestBSL[0].dataValues.Levels);
      }
    });
  });
  return oPromiseLatestBSLevels;
}

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/api/test/all", controller.allAccess);
  app.get("/api/test/user", [authJwt.verifyToken, controller.nurseContent]);
  app.get("/api/test/admin", [
    authJwt.verifyToken,
    authJwt.isAdmin,
    controller.adminContent,
  ]);

  //login
  app.get("/", function (req, res) {
    res.render("login");
  });

  //register
  app.get("/goToRegister", function (req, res) {
    res.writeHead(302, { location: "/register" });
  });

  app.get("/register", function (req, res) {
    res.render("register");
  });

  //view resident list
  app.get("/Residents", authJwt.verifyToken, controller.Residents);

  // view resident profile
  app.get("/ResidentProfile/:id", authJwt.verifyToken, controller.ResidentProfile);


  //add blood sugar levels
  app.post("/api/addBloodSugarLevels", [
    authJwt.verifyToken,
    function (req, res) {
      const patient = {
        Levels: req.body.Levels,
        PatientId: req.body.PatientId,
      };
      //create new rows in table
      db.BloodSugarLevels.create({
        PatientId: patient.PatientId,
        Levels: patient.Levels,
      }).then((bloodSugarLevelsObj) => {
        createPriority(patient.PatientId); //call the method that creates Priority of residents
        res.status(200);
        res.send(bloodSugarLevelsObj);
      });
    },
  ]);

  //add body temperature
  app.post("/api/addBodyTemperature", [
    authJwt.verifyToken,
    function (req, res) {
      const patient = {
        BodyTemperature: req.body.BodyTemperature,
        PatientId: req.body.PatientId,
      };
      //create new rows in table
      db.BodyTemperature.create({
        PatientId: patient.PatientId,
        BodyTemperature: patient.BodyTemperature,
      }).then((bodyTemperatureObjs) => {
        createPriority(patient.PatientId); //call the method that creates Priority of residents
        res.status(200);
        res.send(bodyTemperatureObjs);
      });
    },
  ]);

  //add recent falls
  app.post("/api/addRecentFalls", [
    authJwt.verifyToken,
    function (req, res) {
      const patient = {
        DateTime_Fall: req.body.DateTime_Fall,
        PatientId: req.body.PatientId,
      };
      //create new rows in table
      db.Falls.create({
        PatientId: patient.PatientId,
        DateTime_Fall: patient.DateTime_Fall,
      }).then((fallObjs) => {
        createPriority(patient.PatientId); //call the method that creates Priority of residents
        res.status(200);
        res.send(fallObjs);
      });
    },
  ]);
};

