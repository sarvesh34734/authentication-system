const mongoose = require("mongoose");

const accountVerificationTokenSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    isValid: { type: Boolean, required: true },
    // createdAt: { type: Date, required: true, default: Date.now(), expires: 900 }

}, { timestamps: true });

module.exports = mongoose.model("AccountVerificationToken", accountVerificationTokenSchema);