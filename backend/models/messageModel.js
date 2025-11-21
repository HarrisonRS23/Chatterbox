const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    contents: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    image: {
      data: {
        type: Buffer,
        required: false
      },
      contentType: {
        type: String,
        required: false
      }
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
