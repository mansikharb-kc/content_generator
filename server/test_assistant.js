require('dotenv').config();
const { getAssistantResponse } = require('./utils/ai_assistant');

async function testAssistant() {
    console.log("--- Assistant Connection Test ---");
    console.log("Assistant ID:", process.env.OPENAI_ASSISTANT_ID);
    console.log("API Key found:", !!process.env.OPENAI_API_KEY);

    try {
        console.log("\nSending test prompt to Assistant...");
        const start = Date.now();
        const response = await getAssistantResponse("Hello! Please reply with 'Assistant Connection Successful' if you can read this.");
        const duration = (Date.now() - start) / 1000;

        console.log("\nAssistant Response:", response);
        console.log(`\nTest completed in ${duration}s`);

        if (response.includes("Assistant Connection Successful")) {
            console.log("\n✅ SUCCESS: Project is correctly connected to the AI Assistant.");
        } else {
            console.log("\n⚠️ PARTIAL SUCCESS: Assistant responded, but the message was unexpected.");
        }
    } catch (error) {
        console.error("\n❌ FAILED: Could not connect to the Assistant.");
        console.error("Error details:", error.message);
    }
}

testAssistant();
