require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL or ADMIN_PASSWORD missing in .env"
      );
    }

    if (password.length < 12) {
      throw new Error(
        "Admin password must be at least 12 characters"
      );
    }

    await connectDB();

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      throw new Error(
        "This email already exists. No account was changed."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "EduPortal Admin",
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      isActive: true
    });

    console.log("Admin account created successfully!");

  } catch (error) {
    console.error("Admin Creation Error:", error.message);

  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();
