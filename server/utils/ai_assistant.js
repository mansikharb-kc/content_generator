const OpenAI = require('openai');

let openai;

const getClient = () => {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️  WARNING: OPENAI_API_KEY is not set. Using mock responses.');
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
 * Generates mock marketing content (fallback when OpenAI unavailable)
 * @param {string} prompt
 * @returns {string}
 */
function getMockResponse(prompt) {
    console.warn('⚠️  Using mock response (OpenAI not available)');
    
    const mockResponses = {
        ideas: JSON.stringify({
            marketing_ideas: [
                "Showcase behind-the-scenes architecture catalog production",
                "Feature architect testimonials and project highlights",
                "Partner with interior designers for collaborative content",
                "Create time-lapse videos of architectural designs",
                "Host virtual architecture tours and webinars"
            ]
        }),
        platform: JSON.stringify({
            instagram: "Beautiful architectural catalog designs that inspire. Check our latest collection! 🏛️📚",
            facebook: "Discover premium architectural catalogues that showcase the finest designs in the industry.",
            linkedin: "Industry insights: Modern architectural catalogues are redefining how professionals share designs.",
            twitter: "Architecture enthusiasts, this is what premium catalogues look like! 📐✨"
        })
    };
    
    if (prompt.toLowerCase().includes('idea')) {
        return mockResponses.ideas;
    } else if (prompt.toLowerCase().includes('platform') || prompt.toLowerCase().includes('social')) {
        return mockResponses.platform;
    }
    
    return JSON.stringify({
        response: "Architectural catalogues represent the pinnacle of design documentation and professional presentation.",
        status: "mock_response"
    });
}

/**
 * Sends a prompt to GPT and returns the text response.
 * Falls back to mock responses if OpenAI API is unavailable.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function getAssistantResponse(prompt) {
    const client = getClient();

    // If no API key, use mock response
    if (!client) {
        return getMockResponse(prompt);
    }

    try {
        const completion = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
            max_tokens: 2000,
            timeout: 30000 // 30 second timeout
        });

        const content = completion.choices[0].message.content;
        console.log('✅ OpenAI Response received successfully');
        return content;
    } catch (error) {
        console.error('--- OpenAI API Error ---');
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Type:', error.type);
        
        if (error.message.includes('insufficient_quota')) {
            console.error('❌ QUOTA EXCEEDED: Check billing at https://platform.openai.com/account/billing');
        } else if (error.message.includes('API request failed') || error.code === 'ECONNREFUSED') {
            console.error('❌ Cannot reach OpenAI API. Firewall/Network issue.');
            console.warn('📌 Using mock response as fallback...');
            return getMockResponse(prompt);
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            console.error('❌ Invalid API Key. Check OPENAI_API_KEY environment variable.');
        }
        
        // Fallback to mock response on any error
        console.warn('📌 Falling back to mock response...');
        return getMockResponse(prompt);
    }
}

module.exports = { getAssistantResponse };
