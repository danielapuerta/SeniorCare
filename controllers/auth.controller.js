const db = require("../models");
const config = require("../config/auth.config");
const User = db.User;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    var makeAdmin = false;
    var role = makeAdmin? "admin":"nurse";

    //encrypt password
    console.log("Starting Encrypt Password");
    const saltRounds = 10;
    var oPasswordPromise = new Promise((resolve, reject) => {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            resolve(hash)
        });
    });

    oPasswordPromise.then(value => {
        const user = {
            "firstName": req.body.firstName,
            "lastName": req.body.lastName,
            "nurseCode": req.body.nurseCode,
            "password": value
        };
    
        db.User.findOrCreate({where: {firstName: user.firstName, lastName: user.lastName, nurseCode: user.nurseCode, password: user.password, role: role}})
        .then(([userObj, created]) => {
           //Generate Token
            var token = jwt.sign({ id: userObj.dataValues.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            let options = {
                path:"/",
                sameSite:true,
                maxAge: 1000 * 60 * 60 * 12, // would expire after 24 hours
                httpOnly: true, // The cookie only accessible by the web server
            }
            
            userObj.dataValues.accessToken = token;
            var returnUser = userObj.dataValues;
            res.cookie('x-access-token',token, options);
            res.cookie('role', userObj.dataValues.role, options);
            res.status(200);
            res.send({
                returnUser
            });
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    });
  };

  exports.signin = (req, res) => {
    const user = {
        "nurseCode": req.body.nurseCode,
        "password": req.body.password
    };
    
    db.User.findOne({where: {nurseCode: user.nurseCode}})
    .then((userObj) => {
    if(userObj != undefined)
    {
        //Compare passwords
        var passwordIsValid = bcrypt.compareSync(
            user.password,
            userObj.dataValues.password
        );
        if (!passwordIsValid) {
            return res.status(401).send({
              accessToken: null,
              message: "Invalid Password!"
            });
        }

        //Generate Token
        var token = jwt.sign({ id: userObj.dataValues.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });

        let options = {
            path:"/",
            sameSite:true,
            maxAge: 1000 * 60 * 60 * 12, // would expire after 24 hours
            httpOnly: true, // The cookie only accessible by the web server
        }
        
        userObj.dataValues.accessToken = token;
        var returnUser = userObj.dataValues;
        res.cookie('x-access-token',token, options);
        res.cookie('role', userObj.dataValues.role, options);
        res.status(200).send({
            returnUser
        });

    }
    else{
        res.status(404);
        res.send("User not found");
    }
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
  };

  //make a user an Admin
     exports.makeAdmin = (req, res) => {
        var idAdmin = req.body.id;
        db.User.update(
            {role: "admin"},
            {where: {id: idAdmin}}
        ).then((userObj) => {
            if(userObj != undefined)
            {
                res.status(200);
                res.send({
                    userObj
                });
            }
        })
  };