const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

const addRolesToUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/compliance_db";
    
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: "employee" } }
    );

    console.log(`✓ Updated ${result.modifiedCount} users with default role: employee`);
    console.log("\n⚠️  Update admins manually:");
    console.log("   db.users.updateOne({ email: 'admin@example.com' }, { $set: { role: 'admin' } })");

    await mongoose.connection.close();
    console.log("\n✓ Migration completed");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
};

addRolesToUsers();
