const express = require('express');
const passport = require("passport");
const router = express.Router();
const homeController = require('../controllers/home_controller');
const request = require("request");
const Recaptcha = require("express-recaptcha").RecaptchaV3;
const recaptcha = new Recaptcha(process.env.CAPTCHA_KEY, process.env.CAPTCHA_SECRET);


router.use("/accountVerification", require("./verification"));
router.get("/forgot_password", homeController.forgotPassword)

// middleware to verify recaptcha
verifyCaptcha = function (req, res, next) {
    //if req body is empty or null
    if (req.body === undefined || req.body === '' || req.body === null) {
        console.log("req.body ", req.body);
        req.flash('error', 'reCAPTCHA Incorrect');
        return res.redirect('back');
    }

    //secret key
    const secretKey = process.env.CAPTCHA_SECRET;

    //verification URL
    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.captcha + "&remoteip=" + req.connection.remoteAddress;

    //check if captcha is valid
    request(verificationURL, function (error, response, body) {
        body = JSON.parse(body);
        console.log(body);
        //If not succesful
        if (body.success !== undefined && !body.success) {
            console.log("responseError Failed captcha verification");
            req.flash('error', 'Failed captcha verification');
            return res.redirect('back');
        }
        console.log("responseSuccess Sucess");
        next();
    });

}


router.get("/", homeController.home);
router.post("/create-user", recaptcha.middleware.verify = verifyCaptcha, homeController.createUser);

router.get("/signup", homeController.signUp);
// router.get("/signin", homeController.signin);
// pass passport middleware to authenticate
router.post("/create-session", recaptcha.middleware.verify = verifyCaptcha, passport.authenticate(
    'local',
    {
        failureRedirect: "/",
        failureFlash: true
    }
), homeController.createSession);

router.get("/profile", passport.checkAuthentication, homeController.profile);
router.get("/signout", passport.checkAuthentication, homeController.destroySession);



module.exports = router;