const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");

passport.use(new LocalStrategy({
    usernameField: "email"
}, async function (email, password, done) {

    try {

        const user = await User.findOne({ email: email });
        if (!user) {
            console.log("Invalid email/password");

            return done(null, false, { message: "Invalid email/password" });
        }
        // res.next();
        if (!user.isAuthenticated) {
            console.log("Account not activated");
            return done(null, false, { message: "Account is not activated. Please check your email and activate account" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log("Invalid email/password");

            return done(null, false, { message: "Invalid email/password" });
        }

        return done(null, user);
    } catch{
        (err) => {
            console.log("Error --> passport");
            return done(err);
        }
    }

}
))

//serializing the user to find which key is to be kept in cookie
passport.serializeUser(function (user, done) {
    // store user id in cookie in encrypted form
    done(null, user.id);
})

// deserializing the user from the cookie
passport.deserializeUser(function (id, done) {

    User.findById(id, function (err, user) {
        if (err) {
            console.log("Error --> passport");
            return done(err);
        }
        return done(null, user);
    })

})


// check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
    // if the user is signed in pass on the request to the next controller
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/");
}

// set authenticated user
passport.setAuthenticatedUser = function (req, res, next) {

    // req.user contains current logged in user which we extract for our use in views
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    next();
}

module.exports = passport;