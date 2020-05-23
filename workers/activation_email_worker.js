const queue = require("../config/kue");
const authMailer = require("../mailers/auth_mailer");

queue.process("email", (job, done) => {
    console.log("email worker is processing the job ", job.data);

    authMailer.accountVerificationMail(job.data);

    done();
})