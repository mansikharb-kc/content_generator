require('dotenv').config();
const { getAssistantResponse } = require('./utils/ai_assistant');

async function debugAnalysis() {
    const brandName = "Kohler";
    const persona = "Architect and Designer";
    const communityNiche = "Luxury Residential";

    console.log(`Starting debug analysis for ${brandName}...`);

    try {
        const prompt = `Analyze the architectural brand "${brandName}" for the following target persona: "${persona}" and community niche: "${communityNiche || 'General'}". 
        Return ONLY a JSON object with the following exact keys:
        {
          "overview": {
            "industry": "string",
            "category": "string",
            "positioning": "string",
            "strength": "string"
          },
          "mindset": "string",
          "analysis": "string",
          "benefits": ["string"],
          "useCases": ["string"],
          "whatsappContent": "string",
          "posts": ["string"],
          "strategy": "string"
        }`;

        console.log("Waiting for Assistant...");
        const response = await getAssistantResponse(prompt);
        console.log("Raw Response received:", response);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : response.trim();
        const result = JSON.parse(cleanJson);
        console.log("Successfully Parsed JSON:", JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("DEBUG FAILED:", error);
    }
}

debugAnalysis();
