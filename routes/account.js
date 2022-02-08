require('dotenv').config()
var express = require('express');
const jwt = require('jsonwebtoken');
// const passport = require('passport')
// const passportJWT = require('passport-jwt');
var router = express.Router();
const { User } = require('../models/user')

let jwtOptions = { secretOrKey: process.env.SECRET } 

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
                res.status(201).json({ message: "Registration successful." });
              }
            });
        } else {
          res.status(401).json({ message: "Already registered username." });
        }
      });
  } else {
    res.status(401).json({ message: "Email and password required." });
  }
});


// login
router.post("/login", (req, res, next) => {
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
            message: "User not registered."
          });
        }

        user.authenticate(
          password,
          (err, user) => {
            if (err) {
              res.status(401).json(err);
            }
            
            if (user) {

              try{
              
              const payload = { id: user.id };
              const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1h' });

              res
              .cookie('token', token, {
                httpOnly: true,
                path: '/',
                secure: true,
                sameSite: "none",
                expires: new Date(new Date().getTime() + 60 * 60 * 1000)
              })              
              .cookie('user', user.username, {
                httpOnly: false,
                path: '/',
                secure: true,
                sameSite: "none",
                expires: new Date(new Date().getTime() + 60 * 60 * 1000)
              });
            
            return res.redirect('/account/welcome');

            }
            catch (e){
              return res.json({error: e})
            }
            

            } else {
              res.status(401).json({
                message: "Invalid password."
              });
            }
          });
      });
  } else {
    res.status(401).json({
      message: "Missing username or password."
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
