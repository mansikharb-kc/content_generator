/**
 * DB Setup Script
 * Run: node scripts/setup-db.js
 * 
 * - Tests MongoDB Atlas connection
 * - Lists existing collections
 * - Creates required collections if missing
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

const COLLECTIONS_NEEDED = ['users', 'ideas', 'deletedideas', 'ideaplatformcontents'];

async function setupDatabase() {
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    console.log('   URI:', process.env.MONGODB_URI?.replace(/:([^@]+)@/, ':****@'));

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected successfully!\n');

        const db = mongoose.connection.db;
        const dbName = db.databaseName;
        console.log(`📦 Database: "${dbName}"`);

        // List existing collections
        const existing = await db.listCollections().toArray();
        const existingNames = existing.map(c => c.name);

        console.log(`\n📋 Existing collections (${existingNames.length}):`);
        if (existingNames.length === 0) {
            console.log('   (none yet)');
        } else {
            existingNames.forEach(name => console.log(`   ✅ ${name}`));
        }

        // Create missing collections
        const missing = COLLECTIONS_NEEDED.filter(c => !existingNames.includes(c));
        if (missing.length === 0) {
            console.log('\n✅ All required collections already exist!');
        } else {
            console.log(`\n🛠  Creating ${missing.length} missing collection(s)...`);
            for (const colName of missing) {
                await db.createCollection(colName);
                console.log(`   ✅ Created: "${colName}"`);
            }
        }

        // Final summary
        const final = await db.listCollections().toArray();
        console.log(`\n📊 Final collection list (${final.length}):`);
        final.forEach(c => console.log(`   📁 ${c.name}`));

        // Count documents in each
        console.log('\n📈 Document counts:');
        for (const col of final) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`   ${col.name}: ${count} document(s)`);
        }

        console.log('\n🎉 Database setup complete! Ready to use.\n');
    } catch (err) {
        console.error('\n❌ Connection FAILED:', err.message);
        console.error('\n💡 Possible fixes:');
        console.error('   1. Go to MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0');
        console.error('   2. Check your MONGODB_URI in server/.env');
        console.error('   3. Verify username/password are correct\n');
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

setupDatabase();
