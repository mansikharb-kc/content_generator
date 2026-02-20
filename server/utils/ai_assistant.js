const OpenAI = require('openai');

// Initialize OpenAI inside the function to ensure process.env is loaded
let openai;

const getClient = () => {
    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openai;
};

/**
 * Sends a message to the assistant and waits for the response.
 * @param {string} prompt - The prompt to send to the assistant.
 * @returns {Promise<string>} - The assistant's response.
 */
async function getAssistantResponse(prompt) {
    const client = getClient();
    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is missing from environment variables.");
    }
    if (!assistantId) {
        throw new Error("OPENAI_ASSISTANT_ID is missing from environment variables.");
    }

    try {
        // 1. Create a thread
        const thread = await client.beta.threads.create();
        console.log("Thread created:", thread);

        // 2. Add a message to the thread
        await client.beta.threads.messages.create(thread.id, {
            role: "user",
            content: prompt
        });

        // 3. Run the assistant
        const run = await client.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId
        });
        console.log("Run started:", run.id);

        // 4. Wait for completion using the SDK's poll helper
        const runStatus = await client.beta.threads.runs.poll(run.id, { thread_id: thread.id });

        if (runStatus.status === "failed" || runStatus.status === "cancelled") {
            throw new Error(`AI Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
        }

        // 5. Get the messages
        const messages = await client.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data
            .filter(msg => msg.role === 'assistant')
            .shift();

        return lastMessage ? lastMessage.content[0].text.value : "No response from AI Assistant.";
    } catch (error) {
        console.error("Assistant API Error Details:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { getAssistantResponse };
