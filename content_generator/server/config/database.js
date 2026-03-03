const mongoose = require('mongoose');
const dns = require('dns');

/**
 * MongoDB Connection Utility
 * Handles SRV record resolution issues and provides better logging
 */
const connectDB = async () => {
    // Only set custom DNS if we are having trouble resolving SRV records
    // On many servers (like Vercel), setting DNS servers manually can fail.
    if (process.env.NODE_ENV !== 'production' || process.env.FORCE_CUSTOM_DNS === 'true') {
        try {
            console.log('🌐 Applying custom DNS for SRV resolution...');
            dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
        } catch (dnsErr) {
            console.warn('⚠️ Could not set custom DNS:', dnsErr.message);
        }
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 20000,
            // family: 4, // Try without forcing IPv4 first; add back if still timing out
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);

        // Detailed troubleshooting guidance for the user
        if (err.message.includes('querySrv')) {
            console.error('👉 TIP: Your network might be blocking SRV records. Try adding FORCE_CUSTOM_DNS=true to your .env');
        } else if (err.message.includes('MongooseServerSelectionError')) {
            console.error('👉 TIP: Check if your server IP is whitelisted in MongoDB Atlas (Network Access).');
        }

        // In local development, we want to see the full error.
        // In production, we still throw so the app knows it's not ready.
        throw err;
    }
};

module.exports = connectDB;
