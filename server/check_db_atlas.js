require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to bypass ISP DNS blocks on SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function checkDB() {
    console.log("--- MongoDB Connection Check ---");
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("❌ Error: MONGODB_URI is missing from .env");
        return;
    }

    console.log("URI found (obfuscated):", uri.replace(/\/\/.*@/, "//****:****@"));

    try {
        console.log("Attempting to connect...");
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log("✅ Successfully connected to MongoDB!");
        console.log("Database Name:", mongoose.connection.db.databaseName);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections found:", collections.map(c => c.name).join(', '));

        await mongoose.disconnect();
        console.log("Disconnected.");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed!");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
    }
}

checkDB();
