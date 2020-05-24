const queue = require("../config/kue");
const resetPasswordMailer = require("../mailers/reset_password_mailer");

queue.process("resetEmail", (job, done) => {
    console.log("reset email worker is processing the job ", job.data);


    resetPasswordMailer.resetPasswordMail(job.data);
    done();
})