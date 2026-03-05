const OpenAI = require('openai');

const AppConfig = require('../models/AppConfig');

let openai;
let lastUsedApiKey;

const getClient = async () => {
    // Fetch latest config from DB
    const dbConfig = await AppConfig.findOne();
    const apiKey = dbConfig?.openAiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.warn('⚠️  WARNING: No OpenAI API Key found in DB or ENV. API calls will fail.');
        return null;
    }

    // Re-initialize if key changed or first run
    if (!openai || lastUsedApiKey !== apiKey) {
        const config = {
            apiKey: apiKey,
            timeout: 60 * 1000,
            maxRetries: 3
        };

        if (process.env.OPENAI_API_BASE) {
            config.baseURL = process.env.OPENAI_API_BASE;
        }

        openai = new OpenAI(config);
        lastUsedApiKey = apiKey;
        console.log(`[AI] Client initialized with ${dbConfig?.openAiKey ? 'DB Secret' : 'ENV Secret'}`);
    }
    return openai;
};

/**
 * Sends a prompt to GPT and returns the text response.
 * Supports vision context if prompt is an array of content parts.
 * @param {string|Array} prompt
 * @returns {Promise<string>}
 */
async function getAssistantResponse(prompt) {
    const dbConfig = await AppConfig.findOne();
    const client = await getClient();

    if (!client) {
        throw new Error('OpenAI client not initialized. Check your OPENAI_API_KEY.');
    }

    try {
        // Handle both simple string prompts and complex vision-aware arrays
        const userContent = typeof prompt === 'string'
            ? prompt
            : prompt; // If it's already an array of {type, text/image_url}, OpenAI handles it

        const completion = await client.chat.completions.create({
            model: dbConfig?.openAiModel || process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert AI Marketing Assistant for "Knowledge Center" (https://knowledgecenter.site/).

ABOUT KNOWLEDGE CENTER:
- India's Leading Designing Hub for the architecture and interior design industry.
- Tagline: "CONNECT. CREATE. INSPIRE" and "Where every professional finds inspiration, every brand finds an opportunity, and every idea takes shape."
- Mission: Simplify the construction & design industry — help solve problems in design processes, enhance material selection, optimize vendor management, and introduce innovative solutions to empower architects and designers.
- Target audience: Architects, Interior Designers, Interior Decorators, Design Students, Brands, Architectural Studios, Freelancers.
- Website: https://knowledgecenter.site/
- Contact: Phone: +91 935 5859 802 | Email: info@knowledgecenter.site

SERVICES OFFERED:
1. Material Library — Immersive zone with 3000+ material samples/catalogues, properly listed for easy access. A result-focused environment for architects and designers.
2. Business Center — State-of-the-art meeting space for collaboration, idea exchange, small/large group meetings. Concierge service for KC members.
3. Resource Hub — Curated architectural literature, industry trends, emerging technologies, and an exclusive stationery shop for designers.
4. Rendering Zone — High-performance rendering machines, top-tier software, plotters, and expert professional support.
5. Networking Café — "Food for thought" informal meeting space, managed by F&B professionals, for meaningful design conversations.
6. Parent Co-Working Space — Empowers working parents (especially mothers) with on-site crèche, child-friendly facilities, and professional workspace.

PERSONA TONE GUIDE:
- Brand → Professional, promotional, ROI-focused, engaging. Highlights brand showcase and sponsorship opportunities at KC.
- Student → Simple, educational, inspiring, beginner-friendly. Focuses on career growth, learning, and design community.
- Architect → Technical, precise, structured. Highlights design efficiency, rendering tools, material selection, and professional resources.
- Interior Designer → Creative, aesthetic, stylish, visual. Focuses on material library, inspiration, spatial design, and curated content.

RULES:
- All generated content MUST be relevant to Knowledge Center's services, mission, brand, and target audience.
- If images are provided in the user prompt, analyze them as visual reference to ensure the generated strategy and visual prompts align with the user's specific aesthetics.
- Never generate generic or off-topic marketing content.
- Always respond with valid JSON when asked for structured data.
- Strictly follow the requested quantity for lists.
- Membership enquiry link: https://knowledgecenter.site/enroll-with-us/`
                },
                {
                    role: 'user',
                    content: userContent
                }
            ],
            temperature: 0.75,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
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
