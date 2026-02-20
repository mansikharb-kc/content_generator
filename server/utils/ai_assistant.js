const OpenAI = require('openai');

let openai;

const getClient = () => {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is missing from environment variables.');
        }
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
};

/**
 * Sends a prompt to GPT and returns the text response.
 * Uses Chat Completions API (no Assistant ID required).
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function getAssistantResponse(prompt) {
    const client = getClient();

    try {
        const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',          // fast + cheap, switch to gpt-4o for higher quality
            messages: [
                {
                    role: 'system',
                    content: `You are an expert AI Marketing Assistant for "Knowledge Center" — a company specializing in premium architectural catalogues. 
You help generate creative marketing ideas, social media content, multi-persona analysis, and platform-specific posts.
Always respond with valid JSON when asked for structured data.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 2000
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API Error:', error.message);
        throw error;
    }
}

module.exports = { getAssistantResponse };
