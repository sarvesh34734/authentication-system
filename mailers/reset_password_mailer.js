const nodeMailer = require("../config/nodemailer");

exports.resetPasswordMail = (resetPasswordToken) => {


    // define html string which needs to be rendered
    let htmlString = nodeMailer.renderTemplate({ resetPasswordToken: resetPasswordToken }, "/resetPassword.ejs");
    // send email
    nodeMailer.transporter.sendMail({
        from: `${process.env.GMAIL_USER_ID}@gmail.com`,
        to: resetPasswordToken.user.email,
        subject: "Reset Password Mail",
        html: htmlString
    }, (err, info) => {
        // check for errors
        if (err) {
            console.log("Error in sending mail :: ", err);
            return;
        }

        console.log("Message Sent Successfully", info);
        return;
    })

}