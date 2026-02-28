const fs = require('fs');
const path = require('path');

const promptFile = path.join(__dirname, '..', 'prompts', 'masterPrompt.txt');
let basePrompt = '';
try {
    basePrompt = fs.readFileSync(promptFile, 'utf8').trim();
} catch (err) {
    console.error('Failed to load master prompt:', err);
}

const personaAdjustments = {
    Architect: 'Speak with confident technical clarity, referencing design systems, lead generation pipelines, and premium client attraction while maintaining a professional tone.',
    Brand: 'Tilt the language toward marketing ROI, brand narrative, and positioning to appeal to a business-focused decision maker while staying grounded in measurable outcomes.',
    Student: 'Simplify complex ideas, offer learning-minded context, and include approachable actionable steps for someone building experience.',
    'Interior Designer': 'Lean into sensory language, visual storytelling, and luxe positioning while still emphasizing business growth for high-end clients.',
    default: 'Keep the voice strategic, human, and expert-level while staying aligned with the base instructions.'
};

const buildPersonaPrompt = ({ persona = 'Architect', topic = '' }) => {
    const adjustment = personaAdjustments[persona] || personaAdjustments.default;
    const topicLine = topic ? `Current focus: "${topic}".` : '';

    return `${basePrompt}

Persona-specific notes: ${adjustment}
${topicLine}

Deliverable rules:
- Return ONLY a JSON object with the keys "postText", "captionText", and "imageText".
- postText should be a single scroll-stopping idea (150 characters max) that satisfies all base requirements.
- captionText should expand on the hook with a strategic insight and practical steps, concluding with a subtle CTA for consultation or follow.
- imageText should describe a luxurious, expressive architectural scene with premium materials, lighting, and scale that matches the persona and the post’s narrative. Provide layered sensory cues that make the creative direction feel premium and shareworthy.
- Use line breaks or list formatting within captionText to keep each insight digestible, and try to avoid raw markdown (prefer readable sentences separated by double line breaks instead of "\\n" where possible).\n`;
};

module.exports = { buildPersonaPrompt };
