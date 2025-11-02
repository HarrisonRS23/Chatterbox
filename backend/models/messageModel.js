const mongoose = require("mongoose")
const Schema = mongoose.Schema

const messageSchema = new Schema({
    contents: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
}, {timestamps: true}) // add a created and updated property 

module.exports = mongoose.model('Message', messageSchema) // create message model