
const db = require("../models/index.js");


exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};
exports.nurseContent = (req, res) => {
  res.status(200).send("User Content.");
};
exports.adminContent = (req, res) => {
  res.status(200).send("Admin Content.");
};
exports.Residents = (req, res) => {
  let isAdmin = req.cookies["role"] == "admin";
  db.Residents.findAll({ order: [["priority", "DESC"]] }).then(
    (residentObjs) => {
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      let today = new Date(); 
      for(var i = 0; i < residentObjs.length; i++){
        if(residentObjs[i].dataValues.priority < 5){
          residentObjs[i].dataValues.lowPriorityCategory = true;
        }
        else if(residentObjs[i].dataValues.priority < 10){
          residentObjs[i].dataValues.mediumPriorityCategory = true;
        }
        else{
          residentObjs[i].dataValues.highPriorityCategory = true;
        }

        var milliDiff = today.getTime() - residentObjs[i].updatedAt.getTime();
        var minDiff = Math.floor(milliDiff / 60000);
        residentObjs[i].dataValues.lastChecked = minDiff;

      }
      res.render("residents", {
        residentObjs: residentObjs,
        isAdmin: isAdmin,
      });
    }
  );
};
exports.ResidentProfile = (req,res) =>{
  //view profile
  db.Residents.findAll({
    where: { id: req.params.id },
    order: [["createdAt", "DESC"]],
    limit: 1,
  }).then((residentObj) => {
    var parsedResidentObject = residentObj[0].dataValues;
    //view blood sugar level records
    db.BloodSugarLevels.findAll({
      where: { PatientId: req.params.id },
      order: [["createdAt", "DESC"]],
    }).then((bloodSugarLevelObjs) => {
      //view body temperature records
      db.BodyTemperature.findAll({
        where: { PatientId: req.params.id },
        order: [["createdAt", "DESC"]],
      }).then((bodyTemperatureObjs) => {
        //view recent falls records
        db.Falls.findAll({
          where: { PatientId: req.params.id },
          order: [["createdAt", "DESC"]],
        }).then((fallObjs) => {
          res.render("resident", {
            residentObj: parsedResidentObject,
            bloodSugarLevelObjs: bloodSugarLevelObjs,
            bodyTemperatureObjs: bodyTemperatureObjs,
            fallObjs: fallObjs,
          });
        });
      });
    });
  });
}

exports.deleteResident = (req, res) => {
  var idUser = req.params.id;
  db.Residents.destroy({ where: { id: idUser } }).then((userObj) => {
    if (userObj != undefined) {
      res.status(200);
      res.send({
        userObj,
      });
    }
  });
};

