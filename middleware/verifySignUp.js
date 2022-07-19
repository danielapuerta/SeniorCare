const db = require("../models");
const ROLES = db.ROLES;
const User = db.User;

checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Username
    console.log("Starting Verify Nurse Code");
    User.findOne({
      where: {
        nurseCode:  req.body.nurseCode
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Nurse Code is already in use!"
        });
        return;
      }
      next();
    });
  };
  const verifySignUp = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail
  };
  module.exports = verifySignUp;