const OpenAI = require('openai');

let openai;

const getClient = () => {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️  WARNING: OPENAI_API_KEY is not set. API calls will fail.');
            return null;
        }

        const config = {
            apiKey: process.env.OPENAI_API_KEY,
        };

        // Support for Azure OpenAI or custom endpoint
        if (process.env.OPENAI_API_BASE) {
            config.baseURL = process.env.OPENAI_API_BASE;
        }

        openai = new OpenAI(config);
    }
    return openai;
};

/**
 * Sends a prompt to GPT and returns the text response.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function getAssistantResponse(prompt) {
    const client = getClient();

    if (!client) {
        throw new Error('OpenAI client not initialized. Check your OPENAI_API_KEY.');
    }

    try {
        const completion = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert AI Marketing Assistant for "Knowledge Center". 
Always respond with valid JSON when asked for structured data. 
Ensure you strictly follow the requested quantity for lists.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 3000,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        console.log('✅ OpenAI Response received successfully');
        return content;
    } catch (error) {
        console.error('--- OpenAI API Error ---');
        console.error('Message:', error.message);
        throw error;
    }
}

module.exports = { getAssistantResponse };
