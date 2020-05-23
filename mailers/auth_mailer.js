const nodeMailer = require("../config/nodemailer");

exports.accountVerificationMail = (accountVerificationToken) => {

    // send email
    nodeMailer.transporter.sendMail({
        from: `${process.env.GMAIL_USER_ID}@gmail.com`,
        to: accountVerificationToken.user.email,
        subject: "Authentication Mail",
        html: "<h1>Please Verify Your Email</h1>"
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