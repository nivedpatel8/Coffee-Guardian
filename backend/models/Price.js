const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      enum: ["Coffee", "Black Pepper"],
    },
    variety: {
      type: String,
      required: true,
    },
    market: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      default: "Demo API",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Price", priceSchema);
