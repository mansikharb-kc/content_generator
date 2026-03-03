/**
 * Safely extracts JSON from a string that might contain markdown or other text.
 * @param {string} text 
 * @returns {any}
 */
const extractJson = (text) => {
    try {
        // Try direct parse first
        return JSON.parse(text);
    } catch (e) {
        // Try to find JSON block { ... } or [ ... ]
        const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (innerError) {
                console.error('Failed to parse matched JSON block:', innerError);
                throw innerError;
            }
        }
        throw new Error('No valid JSON found in response');
    }
};

module.exports = { extractJson };
