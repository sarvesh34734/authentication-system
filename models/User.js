const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        validate: validator.isEmail,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // isAuthenticated: {
    //     type: Boolean,
    //     required: true
    // }
});

userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // next();
});

module.exports = mongoose.model("User", userSchema);