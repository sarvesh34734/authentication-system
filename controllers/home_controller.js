const User = require("../models/User");
const validator = require("validator");
const AccountVerificationToken = require("../models/accountVerificationToken");
const crypto = require("crypto");
const authMailer = require("../mailers/auth_mailer");
const authEmailWorker = require("../workers/activation_email_worker");
const queue = require("../config/kue");
const ResetPasswordToken = require("../models/resetPasswordToken");
const resetEmailWorker = require("../workers/reset_password_worker");
const bcrypt = require("bcrypt");

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
            // authMailer.accountVerificationMail(accountVerificationToken);
            let job = queue.create("email", accountVerificationToken).save(function (err) {

                if (err) {
                    console.log("Error in creatin the queue");
                    return;
                }

                console.log("Job created", job.id);
            })
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


// forgot password page render
module.exports.forgotPassword = (req, res) => {

    res.render("forgot_password", {
        title: "Forgot password"
    })

}

// handle reset request
module.exports.resetRequest = async function (req, res) {

    try {
        const user = await User.findOne({ email: req.body.email });

        // if request is authenticated then logout first
        if (req.isAuthenticated()) {
            req.flash("success", "Check for reset password link on mail");
            await req.logout();
           
        }

        // if no user is found
        if (!user) {
            console.log("No user found");
            req.flash("error", "no user found");
            res.redirect("back");
        }
        else {

            // check if token already exists
            const token = await ResetPasswordToken.findOne({ user: user._id });

            if (token && token.isValid) {
                console.log("token exists");
                req.flash("error", "Previous verification link has not expired. Please check your mailbox");
                return res.redirect("back");
            }

            // user found create a reset password token
            let resetPasswordToken = await ResetPasswordToken.create({
                user: user._id,
                token: crypto.randomBytes(35).toString('hex'),
                isValid: true
            })
            // populate reset password token with users email and username
            resetPasswordToken = await resetPasswordToken.populate({
                path: "user",
                select: "email username"
            }).execPopulate();


            //send mail
            let job = queue.create("resetEmail", resetPasswordToken).save(function (err) {

                if (err) {
                    console.log("Error in creating the queue");
                    return;
                }

                console.log("Job created", job.id);
            })
            console.log("mail sent successfully");
            req.flash("success", "mail sent successfully. Link is valid for 15 minutes");
            return res.redirect("back");

        }
    }
    catch (err) {
        console.log("error :: ", err);
        req.flash("Error");
        res.redirect("back");
    }



}

// redirect to reset form if token is correct
module.exports.resetRedirect = async function (req, res) {
    try {
        // if token matches in the database
        const token = await ResetPasswordToken.findOne({ token: req.params.token });
        console.log(token);
        // if token is not found
        if (!token) {
            console.log("Token not found");

            return res.render("invalid_url", {
                title: "Error"
            })
        }
        else {
            // if token is found but is invalid
            if (!token.isValid) {
                console.log("token already used");

                return res.render("invalid_url", {
                    title: "Error"
                })
            } else {
                //set isValid to false
                // token.isValid = false;
                // await token.save();

                // if token is found and isValid
                console.log("authorized");

                return res.render("reset_password", {
                    title: "Reset password",
                    resetPasswordToken: token
                });
            }
        }


    } catch (err) {
        console.log("Error in updating password :: ", err);
        req.flash("error", "Error in updating password");
        res.redirect("back");
    }
}

// update the password
module.exports.updatePassword = async (req, res) => {

    try {
        //if password and confirm_password do not match
        if (req.body.password != req.body.confirm_password) {
            req.flash("error", "passwords don't match");
            return res.redirect("back");
        }

        // check for token and find user
        const token = await ResetPasswordToken.findOne({ token: req.body.resetPasswordToken }).populate({
            path: "user",
            select: "email username password"
        })

        // if there is no token
        if (!token) {
            console.log("invalid token");
            req.flash("error", "Server error");
            return res.redirect("/forgot_password");
        }

        // if token is already used
        if (!token.isValid) {
            console.log("token already used");
            req.flash("error", "URL already used. Try generating another one");
            return res.redirect("/forgot_password");
        }

        // now we have a valid token
        // check if the password match with the previous password
        const match = await bcrypt.compare(req.body.password, token.user.password);

        // if password matches
        if (match) {
            req.flash("error", "Password cannot be same as old password");
            return res.redirect("back");
        }

        // now finally we can update password
        token.user.password = req.body.password;
        await token.user.save();
        token.isValid = false;
        await token.save();
        req.flash("success", "password updated successfully. You can now try logging in");
        res.redirect("/");
    } catch (err) {
        console.log("Error updating password :: ", err);
        req.flash("error", "Error updating password");
        res.redirect("/forgot_password");
    }

}

