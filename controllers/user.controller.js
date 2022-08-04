
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
