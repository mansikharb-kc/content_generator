const mongoose = require('mongoose');
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const IdeaBatch = require('./models/IdeaBatch');
const Idea = require('./models/Idea');

async function checkBatch() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const id = '69a0302176cad284e4d27205';
        const batch = await IdeaBatch.findById(id).populate('ideas');
        console.log('Batch found:', !!batch);
        if (batch) {
            console.log('Topic:', batch.topic);
            console.log('UserId:', batch.userId);
            console.log('Number of ideas:', batch.ideas.length);
            console.log('Ideas array contains nulls:', batch.ideas.includes(null));
            console.log('First idea:', batch.ideas[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBatch();
