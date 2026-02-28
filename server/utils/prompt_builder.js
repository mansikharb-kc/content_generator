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

const buildPersonaPrompt = ({
    persona = 'Architect',
    topic = '',
    refinement = '',
    basePromptText = basePrompt,
    personaNotes = personaAdjustments,
    baseImagePromptText = baseImagePrompt,
    personaImageNotes = imagePersonaAdjustments,
    platform = 'Instagram',
    previousContent = null
}) => {
    const adjustment = personaNotes[persona] || personaNotes.default || personaAdjustments.default;
    const topicLine = topic ? `Current focus: "${topic}".` : '';
    const refinementLine = refinement ? `Refinement note: "${refinement}".` : '';
    const platformLine = `Target Platform: ${platform}. Tailor the format and length (character counts, hashtag styles) specifically for ${platform}.`;

    let contextLine = '';
    if (previousContent) {
        contextLine = `\nPREVIOUS GENERATED CONTENT FOR REFERENCE (for consistency):
        Post Text: ${previousContent.postText}
        Caption: ${previousContent.captionText}
        Please maintain the same core message but adapt it perfectly for the new platform or refinement instructions.`;
    }

    const imageAdjustment = personaImageNotes[persona] || personaImageNotes.default || imagePersonaAdjustments.default;
    return `${basePromptText}

Persona-specific notes: ${adjustment}
${topicLine}
${platformLine}
${refinementLine}
${contextLine}

Image generation guidance:
${imageAdjustment}
Base image direction: ${baseImagePromptText}

Deliverable rules:
- Return ONLY a JSON object with the keys "postText", "captionText", and "imageText".
- postText should be a single scroll-stopping idea (150 characters max) that satisfies all base requirements and platform constraints.
- captionText should expand on the hook with a strategic insight and practical steps, concluding with a subtle CTA for consultation or follow, using ${platform}'s typical engagement style.
- imageText should describe a luxurious, expressive architectural scene with premium materials, lighting, and scale that matches the persona and the post’s narrative. Provide layered sensory cues that make the creative direction feel premium and shareworthy.
- Use line breaks or list formatting within captionText to keep each insight digestible, and try to avoid raw markdown (prefer readable sentences separated by double line breaks instead of "\\n" where possible).\n`;
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
