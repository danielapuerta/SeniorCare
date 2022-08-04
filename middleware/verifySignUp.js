const db = require("../models");
const ROLES = db.ROLES;
const User = db.User;

//checking if the user is a member of the app
checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Username
    console.log("Starting Verify Nurse Code");
    User.findOne({
      where: {
        nurseCode:  req.body.nurseCode
      }
    }).then(user => {
      //user is a var that returns the User object
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