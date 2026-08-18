const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    salt: { type: String, required: true },
    hash: { type: String, required: true },
    role: { type: String, enum: ['user', 'driver', 'admin'], default: 'user' }
});

const userModel = mongoose.model('User', UserSchema)

module.exports = { userModel }
