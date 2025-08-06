const mongoose = require("mongoose");
const Practices = require("../models/Practices");
const practicesData = require("../data/practices.json");
require("dotenv").config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing practices
    await Practices.deleteMany({});

    // Transform and insert data
    const documents = [];

    Object.keys(practicesData).forEach((crop) => {
      Object.keys(practicesData[crop]).forEach((month) => {
        documents.push({
          crop,
          month,
          practices: practicesData[crop][month],
        });
      });
    });

    await Practices.insertMany(documents);
    console.log("Database seeded successfully");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
