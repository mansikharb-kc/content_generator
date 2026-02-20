require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { getAssistantResponse } = require('../utils/ai_assistant');

async function testOpenAI() {
    console.log('\n🤖 Testing OpenAI API...');
    console.log('Key:', process.env.OPENAI_API_KEY ? '✅ SET' : '❌ MISSING');

    try {
        const result = await getAssistantResponse(
            'Generate 3 unique creative marketing ideas for an architectural catalogue platform. Return ONLY a JSON array of strings. Example: ["Idea 1", "Idea 2", "Idea 3"]'
        );
        console.log('\n✅ OpenAI Response:\n', result);

        // Try parsing JSON
        const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
        console.log('\n✅ Parsed Ideas:');
        parsed.forEach((idea, i) => console.log(`  ${i + 1}. ${idea}`));
        console.log('\n🎉 OpenAI is working perfectly!\n');
    } catch (e) {
        console.log('\n❌ OpenAI Error:', e.message);
        if (e.status) console.log('   Status:', e.status);
    } finally {
        process.exit(0);
    }
}

testOpenAI();
