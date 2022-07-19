const express = require("express");
//const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const db = require('./models/index.js');
const exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser')
var favicon = require('serve-favicon');

// var corsOptions = {
//   origin: "http://localhost:8081"
// };

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded());

//Parse Cookies to use the JWt
app.use(cookieParser())

//app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());

//Static Files
app.use(express.static(path.join(__dirname, 'public')))
app.engine('handlebars', exphbs.engine({
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'handlebars');

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

//routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

// simple route
app.get('/', function(req, res) {
      res.render('login');
});

app.get('/goToRegister', function(req, res) {
  res.writeHead(302, {location: '/register'});
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.get('/ResidentProfile/:id', function(req, res) {
  db.Residents.findAll({where: { id:req.params.id},order: [['createdAt', 'DESC']], limit: 1})
  .then(residentObj => {
    var parsedResidentObject = residentObj[0].dataValues;
    res.render('resident', {
      residentObj: parsedResidentObject
    });
  })
});

app.post('/createUser', function(req, res) {
    const user = {
      "firstName": req.body.firstName,
      "lastName": req.body.lastName,
      "nurseCode": req.body.nurseCode,
      "password": req.body.password
    };
    console.log(user);

    db.User.findOrCreate({where: {firstName: user.firstName, lastName: user.lastName, nurseCode: user.nurseCode, password: user.password}})
    .then(([userObj, created]) => {
      res.status(200);
      res.send("User Created successfully");
    });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));