const mongoose = require("mongoose");

const practicesSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    enum: ["Coffee", "Black Pepper", "Coorg Mandrin"],
  },
  month: {
    type: String,
    required: true,
  },
  practices: {
    "Cultural Practices Summary": [String],
    "Nursery Practices": [String],
    "New Clearings": [String],
    "Agronomical Practices": [String],
    "Soil Sampling and Nutrient Management": [String],
    "Top Grafting": [String],
    "Pest Management": [String],
    "Disease Management": [String],
    "Post-Harvest Management": [String],
  },
  customPractices:{
    "Custom Practices": [String]
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Practices", practicesSchema);
