const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    salt: String,
    hash: String
});

const userModel = mongoose.model('User', UserSchema)

module.exports = { userModel }
