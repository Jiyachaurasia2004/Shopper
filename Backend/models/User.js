const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    cartData: Object,
    date: { type: Date, default: Date.now }
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
