require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const mongoose = require('mongoose');
const Idea = require('./models/Idea');

async function listAllIdeas() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");

        const ideas = await Idea.find().sort({ createdAt: -1 }).limit(10);
        console.log(`Found ${ideas.length} ideas.`);

        ideas.forEach((idea, i) => {
            console.log(`[${i}] ID: ${idea._id}, UserID: ${idea.userId}, Content: ${idea.content.substring(0, 30)}...`);
        });

        process.exit(0);
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

listAllIdeas();
