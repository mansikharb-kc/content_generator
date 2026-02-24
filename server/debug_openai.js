require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAI() {
    console.log("--- OpenAI API Debug ---");
    console.log("Date:", new Date().toISOString());
    console.log("API Key present:", !!process.env.OPENAI_API_KEY);

    if (process.env.OPENAI_API_KEY) {
        console.log("API Key length:", process.env.OPENAI_API_KEY.length);
        console.log("API Key starts with:", process.env.OPENAI_API_KEY.substring(0, 7));
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    try {
        console.log("\nAttempting Chat Completion (model: gpt-4o-mini)...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Hello, confirm connection please." }],
        });

        console.log("\n✅ SUCCESS!");
        console.log("Response:", completion.choices[0].message.content);
    } catch (error) {
        console.log("\n❌ FAILED!");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log("Error Method:", error.name);
            console.log("Error Message:", error.message);

            if (error.message.includes('insufficient_quota')) {
                console.log("\n💡 CAUSE: You have run out of OpenAI credits or your billing is not set up correctly.");
            } else if (error.message.includes('invalid_api_key')) {
                console.log("\n💡 CAUSE: The API key in your .env file is incorrect.");
            }
        }
    }
}

testOpenAI();
