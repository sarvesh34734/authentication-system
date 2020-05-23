const nodeMailer = require("../config/nodemailer");

exports.accountVerificationMail = (accountVerificationToken) => {


    // define html string which needs to be rendered
    let htmlString = nodeMailer.renderTemplate({ accountVerificationToken: accountVerificationToken }, "/accountVerification.ejs");
    // send email
    nodeMailer.transporter.sendMail({
        from: `${process.env.GMAIL_USER_ID}@gmail.com`,
        to: accountVerificationToken.user.email,
        subject: "Authentication Mail",
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