const mongoose = require('mongoose');
const Idea = require('./models/Idea');
require('dotenv').config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const id = '69a586bbb527ea48be3a8194';
        const idea = await Idea.findById(id);
        console.log('Idea found:', idea ? idea.content : 'NOT FOUND');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
