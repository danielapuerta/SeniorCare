const db = require("../models"); //require database
const config = require("../config/auth.config"); //require conf secret key
var jwt = require("jsonwebtoken"); //library to generate the token
var bcrypt = require("bcryptjs"); //library to encrypt the password

//req is the registration form in the view
exports.signup = (req, res) => {
  var role = "basic-user"; //everytime a new user registers, their role is set to basic-user
  //encrypt password
  console.log("Starting Encrypt Password");
  const saltRounds = 10; //number of times running the encryption algor
  //create a Promise is to make sure when your request is done
  //create a Promise in order to send the hashed pass to the database
  var oPasswordPromise = new Promise((resolve, reject) => {
    //sending the password and number of times we want to run it through the algor
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      //when it's done, this function will be called with the resolve function
      resolve(hash);
    });
  });
  oPasswordPromise.then((value) => {
    //the value is the hashed password
    const user = {
      //create a user object to stored the data fields input by the user
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      nurseCode: req.body.nurseCode,
      password: value, //value is set equal to password
    };
    db.User.findOrCreate({
      //create a a row of user in the User table
      where: {
        firstName: user.firstName,
        lastName: user.lastName,
        nurseCode: user.nurseCode,
        password: user.password,
        role: role,
      },
    })
      .then(([userObj, created]) => {
        //Generate Token
        var token = jwt.sign({ id: userObj.dataValues.id }, config.secret, {
          expiresIn: 86400, // 24 hours
        });
        let options = {
          path: "/",
          sameSite: true,
          maxAge: 1000 * 60 * 60 * 12, // would expire after 24 hours
          httpOnly: true, // The cookie only accessible by the web server
        };
        userObj.dataValues.accessToken = token;
        var returnUser = userObj.dataValues;
        res.cookie("x-access-token", token, options);
        res.cookie("role", userObj.dataValues.role, options);
        res.status(200);
        res.send({
          returnUser, //returning the user object
        });
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  });
};

exports.signin = (req, res) => {
  const user = {
    nurseCode: req.body.nurseCode,
    password: req.body.password,
  };

  db.User.findOne({ where: { nurseCode: user.nurseCode } })
    .then((userObj) => {
      if (userObj != undefined) {
        //Compare passwords with bcrypt
        var passwordIsValid = bcrypt.compareSync(
          user.password,
          userObj.dataValues.password
        );
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!",
          });
        }
        //Generate Token
        var token = jwt.sign({ id: userObj.dataValues.id }, config.secret, {
          expiresIn: 86400, // 24 hours
        });
        let options = {
          path: "/",
          sameSite: true,
          maxAge: 1000 * 60 * 60 * 12, // would expire after 12 hours
          httpOnly: true, // The cookie only accessible by the web server
        };
        userObj.dataValues.accessToken = token;
        var returnUser = userObj.dataValues;
        res.cookie("x-access-token", token, options);
        res.cookie("role", userObj.dataValues.role, options);
        res.status(200).send({
          returnUser,
        });
      } else {
        res.status(404);
        res.send("User not found");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
exports.Nurses = (req, res) => {
  let isAdmin = req.cookies["role"] == "admin";
  let notAdmin = req.cookies["role"] != "admin";
  db.User.findAll({ order: [["createdAt", "DESC"]] }).then((nurseObjs) => {
    for (var i = 0; i < nurseObjs.length; i++) {
      var nurse = nurseObjs[i];
      var roleNurse = nurse.dataValues.role;
      //adding a new column in datavalues object to check if it's admin
      var isNurseAdmin = roleNurse == "admin";
      nurse.dataValues.isAdmin = isNurseAdmin;
      //adding a new column in datavalues object to check if it's basic user
      var isNotNurseAdmin = roleNurse == "basic-user";
      nurse.dataValues.isNotAdmin = isNotNurseAdmin;
    }
    res.render("nurses", {
      nurseObjs: nurseObjs,
      isAdmin: isAdmin,
      notAdmin: notAdmin,
    });
  });
};
//make a basic-user an admin
exports.makeAdmin = (req, res) => {
  var idAdmin = req.body.id;
  db.User.update({ role: "admin" }, { where: { id: idAdmin } }).then(
    (userObj) => {
      if (userObj != undefined) {
        res.status(200);
        res.send({
          userObj,
        });
      }
    }
  );
};

//make an admin a basic-user
exports.makeBasicUser = (req, res) => {
  var idUser = req.body.id;
  db.User.update({ role: "basic-user" }, { where: { id: idUser } }).then(
    (userObj) => {
      if (userObj != undefined) {
        res.status(200);
        res.send({
          userObj,
        });
      }
    }
  );
};

//delete a user
exports.deleteUser = (req, res) => {
  var idUser = req.body.id;
  db.User.destroy({ where: { id: idUser } }).then((userObj) => {
    if (userObj != undefined) {
      res.status(200);
      res.send({
        userObj,
      });
    }
  });
};

//add new resident into the list
exports.createResident = (req, res) => {
  const user = {
    Name: req.body.Name,
    age: req.body.age,
    RoomNum: req.body.RoomNum,
  };
  db.Residents.findOrCreate({
    where: { Name: user.Name, age: user.age, RoomNum: user.RoomNum },
  }).then(([residentObj, created]) => {
    res.status(200);
    res.send({
      residentObj,
    });
  });
};

