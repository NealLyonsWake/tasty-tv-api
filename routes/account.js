var express = require('express');
const jwt = require('jsonwebtoken');
// const passport = require('passport')
// const passportJWT = require('passport-jwt');
var router = express.Router();
const { User } = require('../models/user')

let jwtOptions = { secretOrKey: "secretSquirrel" }

// register
router.post('/register', (req, res) => {
  if (
    req.body.username &&
    req.body.password
  ) {
    User.findOne({ username: req.body.username },
      (err, user) => {
        if (err) {
          res.status(401).json(err);
        } else if (!user) {
          let newUser = new User({
            username: req.body.username
          });
          User.register(
            newUser,
            req.body.password,
            (err) => {
              if (err) {
                res.status(401).json(err)
              } else {
                res.status(201).json({ message: "registration successful." });
              }
            });
        } else {
          res.status(401).json({ message: "already registered username." });
        }
      });
  } else {
    res.status(401).json({ message: "email and password required." });
  }
});


// login
router.post("/login", function (req, res, next) {
  if (req.body.username && req.body.password) {
    const username = req.body.username;
    const password = req.body.password;

    // authenticate
    User.findOne({ username: username },
      function (err, user) {
        if (err) {
          res.status(401).json(err);
        } else if (!user) {
          return res.status(401).json({
            message: "user not registered."
          });
        }

        user.authenticate(
          password,
          function (err, user) {
            if (err) {
              res.status(401).json(err)
            }
            if (user) {
              const payload = { id: user.id };
              const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1h' });

              res.cookie('token', token, {
                httpOnly: true,
                path: '/',
                secure: true,
                expires: new Date(new Date().getTime() + 20 * 100000)
              })

              res.cookie('user', user.username, {
                httpOnly: false,
                path: '/',
                secure: true,
                expires: new Date(new Date().getTime() + 20 * 100000)
              })

              return res.redirect('/account/welcome')

              // res.status(200).json({
              //   message: "login successful.",
              //   token: token,
              //   id: user.id

              // });
            } else {
              res.status(401).json({
                message: "invalid password."
              });
            }
          });
      });
  } else {
    res.status(401).json({
      message: "missing username or password."
    });
  }
  
});

router.get("/welcome", (req, res) => {
  
  const { cookies } = req
  const jwt = cookies.token
  const user = cookies.user
  
  

  return res.status(202).json({ 
    user: user,
    loggedIn: jwt? true : false})
})


router.get('/signout', (req, res) =>{
  res.status(202).clearCookie('token')
  res.status(202).clearCookie('user').json({ message: 'Cookie deleted.' , loggedIn: false });
});





module.exports = router;
