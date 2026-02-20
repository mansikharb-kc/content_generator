const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to bypass ISP DNS blocks on SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 20000,
            family: 4
        });
        console.log('✅ MongoDB Atlas Connected! DB:', mongoose.connection.db.databaseName);
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
    }
};

module.exports = connectDB;
