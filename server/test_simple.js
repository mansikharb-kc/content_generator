require('dotenv').config();
const OpenAI = require('openai');

async function testConnectionSimple() {
    console.log("Starting simple connection test...");

    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        console.log("1. Checking Assistant access...");
        const assistant = await client.beta.assistants.retrieve(process.env.OPENAI_ASSISTANT_ID);
        console.log("✅ Found Assistant:", assistant.name);

        console.log("2. Creating Thread...");
        const thread = await client.beta.threads.create();
        console.log("✅ Thread Created:", thread.id);

        console.log("3. Sending Message...");
        await client.beta.threads.messages.create(thread.id, {
            role: "user",
            content: "Ping"
        });
        console.log("✅ Message Sent");

        console.log("4. Running Assistant...");
        const run = await client.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id
        });
        console.log("✅ Run Started:", run.id);

    } catch (error) {
        console.log("❌ Test Failed");
        console.error("Status:", error.status);
        console.error("Error Code:", error.code);
        console.error("Message:", error.message);
    }
}

testConnectionSimple();
