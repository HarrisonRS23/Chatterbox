const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    contents: {
      type: String,
      required: true,
      trim: true
    },
    sender: {
      type: Schema.Types.ObjectId,  // references the User model
      ref: "User",
      required: true
    },
    recipient: {
      type: Schema.Types.ObjectId,  // references the User model
      ref: "User",
      required: true
    }
  },
  { timestamps: true } 
);


module.exports = mongoose.model("Message", messageSchema);
