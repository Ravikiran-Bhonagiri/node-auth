var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash  = require('connect-flash');

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  console.log('get request /users/register')
  res.render('register', {title:'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title:'Login'});
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/users/login'}),
  function(req, res) {
    console.log("You are successfully logged in");
    //req.flash('success', 'You are now logged in');
    res.redirect('/');
});

/*
router.post('/login',
  passport.authenticate('local', { failureRedirect: '/users/login'}),
  function(req, res) {
    console.log("You are successfully logged in");
    //req.flash('success', 'You are now logged in');
    res.redirect('/');
});
*/

passport.serializeUser(function(user, done) {
  console.log('Serialize User');
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('Deserialize User');
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        console.log('Incorrect username.');
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        console.log('Incorrect password.');
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
*/


passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
}));


/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log('entering the localstrategy function');
    User.getUserByUsername( username,
      function (err, user) {
       if (err) throw err;
       if (!user) {
         console.log("Unknown user");
         return done(null, false, {message: 'Unknown User'});
       }

       User.comparePassword( password, user.password,
         function(err, isMatch){
           if(err) return done(err);
           if(isMatch) {
             return done(null, user);
           } else {
            console.log("Invalid password");
            return done(null, false, {message: 'Invalid Password'});
           }
       });

   });
}));
*/

router.post('/register', upload.single('profileimage'), function(req, res, next) {
  //console.log(req.body.name);
  //console.log(req.body);

  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  if( req.file ) {// to chec the uploaded files
    //console.log('Uploading File....');
    //console.log(req.file);
    var profileimage = req.file.filename;
  } else {
    //console.log('No File uploaded...');
    var profileimage = 'noimage.jpg';
  }

  // Form Validator
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'email field is required').notEmpty();
  req.checkBody('email', 'email is not valid').isEmail();
  req.checkBody('username', 'username is required').notEmpty();
  req.checkBody('password', 'password is required').notEmpty();
  req.checkBody('password2', 'password2 is required').equals(req.body.password);


  // Check errors
  var errors = req.validationErrors();

  if(errors){
    //console.log('Errors');
    //console.log(errors);
    res.render('register', {
      errors: errors
    });
  } else {
    //console.log('No Errors');
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    //req.flash('success', 'You are now registered and can login');

    res.location('/');
    res.redirect('/');
  }
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/users/login');
  //req.flash('success', "You are now logged out");
});


module.exports = router;
