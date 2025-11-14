const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

})

module.exports = mongoose.model('User', userSchema) // create user model