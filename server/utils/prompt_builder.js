const fs = require('fs');
const path = require('path');

const promptFile = path.join(__dirname, '..', 'prompts', 'masterPrompt.txt');
const imagePromptFile = path.join(__dirname, '..', 'prompts', 'imageMasterPrompt.txt');
let basePrompt = '';
let baseImagePrompt = '';
try {
    basePrompt = fs.readFileSync(promptFile, 'utf8').trim();
} catch (err) {
    console.error('Failed to load master prompt:', err);
}
try {
    baseImagePrompt = fs.readFileSync(imagePromptFile, 'utf8').trim();
} catch (err) {
    console.error('Failed to load image master prompt:', err);
}

const personaAdjustments = {
    Architect: 'Speak with clear, simple, and professional language. Focus on "Industry Leadership," "Design Vision," and "Portfolio Value." DO NOT mention leads, budgets, or problems. Reference high-end results and the transformation into a top-tier studio.',
    Brand: 'Use simple and powerful words. Focus on "Prestige," "Strategic Positioning," and "Future Expansion." Highlight the value of high-end collaborations and visionary growth. DO NOT use salesy language or mention pain points.',
    Student: 'Use easy-to-understand English. Focus on "Professional Evolution," "Industry Inspiration," and "Growth Mindset." Help them see the future path to excellence. DO NOT mention struggles, lack of experience, or low leads.',
    'Interior Designer': 'Use clear and basic English. Focus on "Aesthetic Authority," "Visual Storytelling," and "High-End Results." Highlight the transformation of space and career. DO NOT mention budgets or client problems.',
    default: 'Keep the voice strategic, human, and visionary but use SIMPLE ENGLISH that is easy for everyone to understand. Focus on value, results, and future potential. Avoid all negative/problem-based hooks.'
};

const imagePersonaAdjustments = {
    Architect: 'Frame the scene with technical tools, plans, and confident design leaders in a glass studio; showcase high-end material finishes and organized creativity.',
    Brand: 'Shoot the room like a premium brand film—highlighting refined surfaces, cinematic lighting, and leaders who represent prestige and measurable growth.',
    Student: 'Capture aspirational collaboration amidst digital tools, framed in warm light to feel accessible but still premium.',
    'Interior Designer': 'Focus on tactile material boards, curated textures, and dramatic yet cozy lighting that communicates luxury storytelling.',
    default: 'Keep it cinematic, dramatic, and authentic—think professional architectural photoshoot without stock clichés.'
};

const PLATFORM_CONSTRAINTS = {
    Instagram: {
        caption: '35 words. Aspirational hook.',
        postText: '40-50 words. Pure value and future vision.',
        imageStyle: 'High-end, architectural, aesthetic'
    },
    Facebook: {
        caption: '35 words. Professional/Community focus.',
        postText: '40-50 words. Growth oriented.',
        imageStyle: 'Clean, professional'
    },
    Pinterest: {
        caption: '35 words. Inspirational.',
        postText: '40-50 words. Educational/Inspirational.',
        imageStyle: 'Vertical, aesthetic'
    },
    YouTube: {
        caption: '45 words. Visionary outline.',
        postText: '60-150 words. Deep strategic breakdown.',
        imageStyle: 'Bold, high-contrast, premium'
    },
    LinkedIn: {
        caption: '35 words. B2B growth focus.',
        postText: '40-50 words. Strategic insights.',
        imageStyle: 'Corporate, high-level'
    },
    WhatsApp: {
        caption: '35 words. Direct value.',
        postText: '40-50 words. Concise strategic tips.',
        imageStyle: 'Simple, impactful'
    },
    'WhatsApp Community': {
        caption: '35 words. Direct value.',
        postText: '40-50 words. Community growth focus.',
        imageStyle: 'Simple, impactful'
    }
};

const buildPersonaPrompt = ({
    persona = 'Architect',
    topic = '',
    refinement = '',
    basePromptText = basePrompt,
    personaNotes = personaAdjustments,
    baseImagePromptText = baseImagePrompt,
    personaImageNotes = imagePersonaAdjustments,
    platform = 'Instagram',
    previousContent = null,
    analysis = '', // Added strategic analysis context
    imageUrls = [], // Added support for reference images
    exampleIdeas = [] // New: Support for global "training" examples
}) => {
    const adjustment = personaNotes[persona] || personaNotes.default || personaAdjustments.default;
    const topicLine = topic ? `Current focus: "${topic}".` : '';
    const analysisLine = analysis ? `Strategic Analysis Context: "${analysis}".` : '';
    const refinementLine = refinement ? `Refinement note: "${refinement}".` : '';

    const exampleLine = exampleIdeas.length > 0
        ? `\nKNOWLEDGE CENTER REFERENCE EXAMPLES (Model your new content after these high-performing styles):\n${exampleIdeas.map(ex => `- REFERENCE: ${ex.title}`).join('\n')}\n`
        : '';

    const constraints = PLATFORM_CONSTRAINTS[platform] || {};
    const platformLine = `Target Platform: ${platform}. 
    Critical constraints for ${platform}:
    - Post Content length: ${constraints.postText || '35 words'}.
    - Caption length: ${constraints.caption || 'Tailor to standard platform length'}.
    - Image style: ${constraints.imageStyle || 'Premium'}.
    - Content focus: ${constraints.bestContent || 'Relevant to audience'}.
    Tailor the format and length (character counts, hashtag styles) specifically for ${platform}.`;

    let contextLine = '';
    if (previousContent) {
        contextLine = `\nPREVIOUS GENERATED CONTENT FOR REFERENCE (for consistency):
        Post Text: ${previousContent.postText}
        Caption: ${previousContent.captionText}
        Image Prompt: ${previousContent.imageText}
        Please maintain the same core message and visual direction but adapt it perfectly for the new platform or refinement instructions.`;
    }

    const imageAdjustment = personaImageNotes[persona] || personaImageNotes.default || imagePersonaAdjustments.default;

    const textPrompt = `SYSTEM PROTOCOL:
${basePromptText}

PERSONA STRATEGY: ${adjustment}

${exampleLine}
${topicLine}
${analysisLine}
${platformLine}
${refinementLine}
${contextLine}

CRITICAL EXECUTION RULES:
- Use SIMPLE, CLEAN, and DIRECT English. Avoid complicated jargon, flowery words, or complex metaphors. Make sure the value is clear to any reader.
- DO NOT mention "leads", "budgets", "low sales", "low-quality clients", or "searching for work".
- DO NOT start with a "pain point".
- ALWAYS start with a "Possibility" or "Visionary Hook".
- Focus purely on "Professional Evolution", "Industry Authority", and "High-End Transformation".
- Treat the audience as successful and looking to level up.

Image generation guidance:
${imageAdjustment}
Base image direction: ${baseImagePromptText}

Deliverable rules:
- Return ONLY a JSON object with the keys "postText", "captionText", and "imageText".
- postText should be high-value detailed content (${constraints.postText || '40-50 words'})—including strategic insights and practical steps—that satisfies all base requirements. 
- captionText should be a scroll-stopping hook and strategic summary (${constraints.caption || '35 words'}).
- imageText should describe a luxurious, expressive scene matching the visionary narrative. 
- Use readable sentences and double line breaks for readability.`;

    // If we have images, we return the vision-friendly format
    if (imageUrls && imageUrls.length > 0) {
        const content = [
            { type: 'text', text: textPrompt }
        ];
        imageUrls.forEach(url => {
            content.push({
                type: 'image_url',
                image_url: { url: url }
            });
        });
        return content;
    }

    return textPrompt;
};


const getMasterPrompt = () => basePrompt;
const getMasterImagePrompt = () => baseImagePrompt;

module.exports = {
    buildPersonaPrompt,
    getMasterPrompt,
    getMasterImagePrompt,
    personaAdjustments,
    imagePersonaAdjustments
};

