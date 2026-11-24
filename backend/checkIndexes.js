const mongoose = require("mongoose");
require("dotenv").config();

async function checkIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("\nConnected to MongoDB");

    const indexes = await mongoose.connection
      .collection("users")
      .indexes();

    console.log("\n========== USER INDEXES ==========\n");

    indexes.forEach((index) => {
      console.log(JSON.stringify(index, null, 2));
      console.log("----------------------------------");
    });

  } catch (error) {
    console.error("Index check error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkIndexes();
