const mongoose = require("mongoose");

const accountVerificationToken = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    isValid: {
        type: Boolean,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("AccountVerificationToken", accountVerificationToken);