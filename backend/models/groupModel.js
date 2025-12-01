const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: ""
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);

