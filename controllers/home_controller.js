const User = require("../models/User");
module.exports.signUp = function (req, res, next) {
    if (req.isAuthenticated()) {
        req.flash("error", "You need to log out first");
        return res.redirect("/profile");
    }
    res.render("sign-up", { title: "Sign Up" });

}
module.exports.home = function (req, res) {
    if (req.isAuthenticated()) {
        req.flash("error", "You need to log out first");
        return res.redirect("/profile");
    }
    res.render("home", { title: "home" })
}
module.exports.createUser = async function (req, res, next) {
    try {

        const username = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (username) {
            console.log("Username/Email already exists");
            req.flash("error", "Username/Email already exists");
            res.redirect("back");
        } else {
            if (req.body.password != req.body.confirm_password) {
                console.log("Password don't match");
                req.flash("error", "Password don't match");
                res.redirect("back");
            }
            // check for null or empty values
            for (let key in req.body) {
                let val = req.body[key];
                if (val == null || val == "") {
                    // req.flash("error", `${key} cannot be empty`);
                    return res.redirect("/signup");
                }
            }
            const user = await User.create(req.body);
            console.log(req.body);
            res.redirect("/");
        }

    } catch{
        (err) => {
            console.log(err);
            res.redirect("back");
        }
    }
}

// create session
module.exports.createSession = function (req, res) {

    req.flash("success", "Logged in successfully");
    return res.redirect("/profile");
}

//signin
// module.exports.signin = function (req, res) {
//     if (req.isAuthenticated()) {
//         req.flash("error", "You need to log out first");
//         return res.redirect("/profile");
//     }

//     res.render("sign_in", { title: "Sign-In" });
// }

//profile
module.exports.profile = function (req, res, next) {
    res.render("profile", { title: "Profile" })
}

// desroy session
module.exports.destroySession = function (req, res, next) {
    // this functionality is given by passport.js
    req.logout();
    req.flash("success", "Signed out successfully");

    res.redirect("/");
}