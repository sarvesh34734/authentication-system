const User = require("../models/User");
const validator = require("validator");
const AccountVerificationToken = require("../models/accountVerificationToken");
const crypto = require("crypto");
const authMailer = require("../mailers/auth_mailer");

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
        // check if email is valid or not
        if (!validator.isEmail(req.body.email)) {
            req.flash("error", "Email is not valid");
            res.redirect("back");
        }

        const username = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });

        // if user already exists
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

            const user = await User.create({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                isAuthenticated: false,
            });

            // if user is created create accountVerificationToken

            let accountVerificationToken = await AccountVerificationToken.create({
                user: user._id,
                token: crypto.randomBytes(35).toString('hex'),
                isValid: true
            })

            // populate account varification token with users email and username
            accountVerificationToken = await accountVerificationToken.populate({
                path: "user",
                select: "email username"
            }).execPopulate();

            // if user is created successfully send mail to the user
            authMailer.accountVerificationMail(accountVerificationToken);
            console.log("mail sent");
            return res.redirect("/");
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

// activate user from email
module.exports.activateAccount = async function (req, res) {

    try {
        // get verification token
        const token = req.params.token;
        // find token in database
        const account = await AccountVerificationToken.findOne({ token: token });

        // check if account is not found or the link isn't valid

        if (account && account.isValid == false) {

            // try searching for users authentication status
            const user = await User.findById(account.user);

            // if user is found and its authentication status is true
            if (user && user.isAuthenticated) {
                console.log("already activated");
                req.flash("error", "Your account is already activated. Try Logging in");
                res.redirect("/");
            }

        }
        else if (account && account.isValid == true) {
            // find user and set its authentication status to true
            const user = await User.findByIdAndUpdate(account.user, { isAuthenticated: true });
            // if user is found
            if (user) {
                console.log("account activated");
                // set isValid of token to false;
                account.isValid = false;
                await account.save();
                req.flash("success", "Account activated successfully");
                res.redirect("/");
            }
        }
    } catch (err) {
        console.log("Error :: ", err);
        req.flash("error", "Error in activating account");
        res.redirect("/");
    }
}