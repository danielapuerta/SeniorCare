
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

