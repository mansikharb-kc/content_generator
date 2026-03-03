require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const dns = require('dns');

// Apply DNS fix
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        const email = 'mansi.kharb@kc-one.co';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`✅ User found: ${user.name} (${user.role})`);
        } else {
            console.log(`❌ User NOT found: ${email}`);
            console.log('Available users:');
            const allUsers = await User.find({}, 'email name');
            allUsers.forEach(u => console.log(`- ${u.email} (${u.name})`));
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

checkUser();
