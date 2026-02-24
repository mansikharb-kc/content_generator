const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const { Client } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function checkAll() {
    console.log("=== ALL CONNECTIONS CHECK ===\n");

    // 1. MongoDB Atlas
    console.log("1. MongoDB Atlas:");
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.log("   ❌ MONGODB_URI missing from .env\n");
    } else {
        try {
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, family: 4 });
            console.log("   ✅ Connected! DB:", mongoose.connection.db.databaseName);
            await mongoose.disconnect();
        } catch (err) {
            console.log("   ❌ Failed:", err.message, "\n");
        }
    }

    // 2. Local MySQL
    console.log("2. Local MySQL:");
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Mansi@123',
            connectTimeout: 5000
        });
        const [rows] = await connection.query('SELECT VERSION() as version');
        console.log("   ✅ Connected! Version:", rows[0].version);
        await connection.end();
    } catch (err) {
        console.log("   ❌ Failed:", err.message, "\n");
    }

    // 3. Neon Postgres (Zoho Sync)
    console.log("3. Neon Postgres:");
    const pgConnString = 'postgresql://neondb_owner:npg_3GOFaqk1NtWm@ep-little-sea-ah94cclk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
    const pgClient = new Client({ connectionString: pgConnString, connectionTimeoutMillis: 5000 });
    try {
        await pgClient.connect();
        const res = await pgClient.query('SELECT version()');
        console.log("   ✅ Connected! Version:", res.rows[0].version.split(' ')[1]);
        await pgClient.end();
    } catch (err) {
        console.log("   ❌ Failed:", err.message, "\n");
    }

    console.log("\n=== CHECK COMPLETE ===");
}

checkAll().catch(err => console.error("Script Error:", err));
