const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_3GOFaqk1NtWm@ep-little-sea-ah94cclk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testPostgres() {
    console.log("--- Testing Zoho Sync Postgres Connection ---");
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("✅ Successfully connected to Neon Postgres!");
        const res = await client.query('SELECT NOW()');
        console.log("Current Time from DB:", res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error("❌ Postgres Connection Failed!");
        console.error(err.message);
    }
}

testPostgres();
