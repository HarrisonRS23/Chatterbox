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
      type: Schema.Types.ObjectId,  // references the User model (for 1-on-1 messages)
      ref: "User",
      required: false
    },
    group: {
      type: Schema.Types.ObjectId,  // references the Group model (for group messages)
      ref: "Group",
      required: false
    }
  },
  { timestamps: true } 
);


module.exports = mongoose.model("Message", messageSchema);
