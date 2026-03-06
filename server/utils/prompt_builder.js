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
    Architect: 'Speak with confident technical clarity, referencing design systems, lead generation pipelines, and premium client attraction while maintaining a professional tone.',
    Brand: 'Tilt the language toward marketing ROI, brand narrative, and positioning to appeal to a business-focused decision maker while staying grounded in measurable outcomes.',
    Student: 'Simplify complex ideas, offer learning-minded context, and include approachable actionable steps for someone building experience.',
    'Interior Designer': 'Lean into sensory language, visual storytelling, and luxe positioning while still emphasizing business growth for high-end clients.',
    default: 'Keep the voice strategic, human, and expert-level while staying aligned with the base instructions.'
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
        caption: '35 words',
        postText: '40-50 words',
        imageStyle: 'Casual, lifestyle, trendy, attractive visuals',
        bestContent: 'product photos, reels covers, travel images, influencer style content.'
    },
    Facebook: {
        caption: '35 words',
        postText: '40-50 words',
        imageStyle: 'Promotional and informative graphics',
        bestContent: 'offers, announcements, event posters, marketing banners.'
    },
    Pinterest: {
        caption: '35 words',
        postText: '40-50 words',
        imageStyle: 'Infographic, vertical, educational images',
        bestContent: 'tutorials, step-by-step guides, blog graphics, idea pins.'
    },
    YouTube: {
        caption: '45 words',
        postText: '60-150 words',
        imageStyle: 'Bold, high-contrast thumbnail with big text or face expressions',
        bestContent: 'video thumbnails, tutorials, reviews, educational videos.'
    },
    LinkedIn: {
        caption: '35 words',
        postText: '40-50 words',
        imageStyle: 'Professional and corporate design',
        bestContent: 'business insights, company updates, charts, office or professional photos.'
    },
    WhatsApp: {
        caption: '35 words',
        postText: '40-50 words',
        imageStyle: 'Simple and clear graphics',
        bestContent: 'quick offers, announcements, product updates, reminders.'
    },
    'WhatsApp Community': {
        caption: '35 words',
        postText: '40-50 words',
        imageStyle: 'Simple and clear graphics',
        bestContent: 'quick offers, announcements, product updates, reminders.'
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

    const textPrompt = `${basePromptText}

Persona-specific notes: ${adjustment}
${exampleLine}
${topicLine}
${analysisLine}
${platformLine}
${refinementLine}
${contextLine}

Image generation guidance:
${imageAdjustment}
Base image direction: ${baseImagePromptText}

Deliverable rules:
- Return ONLY a JSON object with the keys "postText", "captionText", and "imageText".
- postText should be the high-value detailed content (${constraints.postText || '40-50 words'})—including the strategic insights and practical steps/framework—that satisfies all base requirements and platform constraints. For YouTube, this is the detailed video outline or key script points.
- captionText should be the scroll-stopping hook and strategic meta-information (${constraints.caption || '35 words'}), including a brief high-level summary of the marketing goal, a call to action for Knowledge Center, and relevant hashtags. This is the supplementary "other information" that provides context to the main strategy. Ensure you follow the platform-specific length requirements mentioned above.
- imageText should describe a scene that matches both the persona and the platform's requested style (${constraints.imageStyle || 'Premium'}). Describe a luxurious, expressive architectural scene with premium materials, lighting, and scale that matches the post’s narrative. Provide layered sensory cues that make the creative direction feel premium and shareworthy.
- Use line breaks or list formatting within captionText to keep each insight digestible, and try to avoid raw markdown (prefer readable sentences separated by double line breaks instead of "\\n" where possible).\n`;

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

