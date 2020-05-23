const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.GMAIL_USER_ID,
        pass: process.env.GMAIL_PASSWORD,
    },
})

// render template
let renderTemplate = (data, relativePath) => {
    let mailHTML;
    ejs.renderFile(path.join(__dirname, "../views/mailers", relativePath),
        data,
        function (err, template) {

            if (err) {
                console.log("Error in rendering template:: ", err);
                return;
            }

            mailHTML = template;

        }
    );

    // return mailHTML
    return mailHTML;
}

// export all the keys
module.exports = {
    transporter: transporter,
    renderTemplate: renderTemplate
}