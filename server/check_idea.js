const mongoose = require('mongoose');
require('dotenv').config();
const Idea = require('./models/Idea');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const id = '69a976a3d19589c440918e7c';
        const idea = await Idea.findById(id);
        if (idea) {
            console.log('IDEA_FOUND:', JSON.stringify(idea, null, 2));
        } else {
            console.log('IDEA_NOT_FOUND:', id);
            const anyIdea = await Idea.findOne();
            console.log('ANY_IDEA_IN_DB:', anyIdea ? anyIdea._id : 'NONE');
        }
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}
check();
