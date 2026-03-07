/**
 * Safely extracts JSON from a string that might contain markdown or other text.
 * @param {string} text 
 * @returns {any}
 */
const extractJson = (text) => {
    if (!text) throw new Error('Empty response from AI');

    // Try direct parse first
    try {
        return JSON.parse(text);
    } catch (e) {
        // Try to strip markdown code blocks
        const cleanText = text.replace(/```json\n?|```/g, '').trim();
        try {
            return JSON.parse(cleanText);
        } catch (innerE) {
            // Last resort: find the first { and the last }
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');

            if (start !== -1 && end !== -1 && end > start) {
                const possibleJson = text.substring(start, end + 1);
                try {
                    return JSON.parse(possibleJson);
                } catch (finalE) {
                    console.error('Final JSON parse attempt failed:', finalE.message);
                }
            }
            throw new Error('No valid JSON found in AI response after multiple attempts');
        }
    }
};

module.exports = { extractJson };
