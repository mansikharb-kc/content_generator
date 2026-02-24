require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const { getAssistantResponse } = require('./utils/ai_assistant');
const { extractJson } = require('./utils/json_helper');
const mongoose = require('mongoose');

async function testGenerateLogic() {
    console.log("--- Testing Generate Endpoint Logic ---");

    // Connect to DB (needed for Idea.create)
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");
    } catch (e) {
        console.error("DB Connection failed", e.message);
        return;
    }

    const count = 3;
    const prompt = `Generate ${count} unique and creative marketing ideas for an architectural catalogue platform.
    Focus on luxury, sustainability, and innovation.
    Return ONLY a JSON array of strings. Example: ["Idea 1", "Idea 2"]`;

    try {
        console.log("Calling OpenAI...");
        const aiResponseText = await getAssistantResponse(prompt);
        console.log("Raw Response:", aiResponseText);

        console.log("Extracting JSON...");
        let generatedTexts = extractJson(aiResponseText);
        console.log("Extracted Texts:", generatedTexts);

        if (!Array.isArray(generatedTexts)) {
            console.log("Not an array, wrapping in array");
            generatedTexts = [aiResponseText];
        }

        console.log("Attempting to save to DB (Mocking user ID: dev_user)...");
        // We don't actually need the Idea model to test the extraction, but let's test the save too
        const Idea = require('./models/Idea');
        const newIdeas = [];
        for (const text of generatedTexts) {
            const idea = await Idea.create({ userId: "dev_user", content: text });
            newIdeas.push(idea);
            console.log("Saved Idea ID:", idea._id);
        }

        console.log("\n✅ LOGIC SUCCESSFUL!");
        process.exit(0);
    } catch (err) {
        console.error("\n❌ LOGIC FAILED!");
        console.error("Error Message:", err.message);
        console.error("Stack:", err.stack);
        process.exit(1);
    }
}

testGenerateLogic();
