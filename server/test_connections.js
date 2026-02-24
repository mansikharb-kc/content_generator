require('dotenv').config();
const mongoose = require('mongoose');
const OpenAI = require('openai');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

const tests = [];

async function runTests() {
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}         SYSTEM CONNECTION & HEALTH CHECK${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    // Test 1: Environment Variables
    console.log(`${colors.yellow}1. Checking Environment Variables...${colors.reset}`);
    const envVars = {
        'PORT': process.env.PORT,
        'JWT_SECRET': process.env.JWT_SECRET ? '✓ Set' : '✗ Missing',
        'MONGODB_URI': process.env.MONGODB_URI ? '✓ Set' : '✗ Missing',
        'OPENAI_API_KEY': process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing'
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
        const status = value === '✓ Set' || value ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
        console.log(`   ${status} ${key}: ${value}`);
    });

    // Test 2: MongoDB Connection
    console.log(`\n${colors.yellow}2. Testing MongoDB Atlas Connection...${colors.reset}`);
    try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 20000,
            family: 4
        });
        console.log(`   ${colors.green}✓${colors.reset} MongoDB connected successfully`);
        console.log(`   ${colors.green}✓${colors.reset} Database: content_generator`);
        tests.push({ name: 'MongoDB', status: 'OK' });
        await mongoose.disconnect();
    } catch (err) {
        console.log(`   ${colors.red}✗${colors.reset} MongoDB connection failed: ${err.message}`);
        tests.push({ name: 'MongoDB', status: 'FAILED' });
    }

    // Test 3: OpenAI API
    console.log(`\n${colors.yellow}3. Testing OpenAI API Connection...${colors.reset}`);
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not set');
        }
        
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const testResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say OK in one word' }
            ],
            max_tokens: 10
        });

        console.log(`   ${colors.green}✓${colors.reset} OpenAI API connected successfully`);
        console.log(`   ${colors.green}✓${colors.reset} Model: ${testResponse.model}`);
        console.log(`   ${colors.green}✓${colors.reset} Response: ${testResponse.choices[0].message.content}`);
        tests.push({ name: 'OpenAI API', status: 'OK' });
    } catch (err) {
        console.log(`   ${colors.red}✗${colors.reset} OpenAI API failed: ${err.message}`);
        tests.push({ name: 'OpenAI API', status: 'FAILED' });
    }

    // Test 4: JWT Secret
    console.log(`\n${colors.yellow}4. Checking JWT Configuration...${colors.reset}`);
    if (process.env.JWT_SECRET) {
        console.log(`   ${colors.green}✓${colors.reset} JWT_SECRET is configured`);
        console.log(`   ${colors.green}✓${colors.reset} Length: ${process.env.JWT_SECRET.length} characters`);
        tests.push({ name: 'JWT', status: 'OK' });
    } else {
        console.log(`   ${colors.red}✗${colors.reset} JWT_SECRET not configured`);
        tests.push({ name: 'JWT', status: 'FAILED' });
    }

    // Test 5: Models
    console.log(`\n${colors.yellow}5. Checking Mongoose Models...${colors.reset}`);
    try {
        const User = require('./models/User');
        const Idea = require('./models/Idea');
        const DeletedIdea = require('./models/DeletedIdea');
        const IdeaPlatformContent = require('./models/IdeaPlatformContent');
        
        console.log(`   ${colors.green}✓${colors.reset} User model loaded`);
        console.log(`   ${colors.green}✓${colors.reset} Idea model loaded`);
        console.log(`   ${colors.green}✓${colors.reset} DeletedIdea model loaded`);
        console.log(`   ${colors.green}✓${colors.reset} IdeaPlatformContent model loaded`);
        tests.push({ name: 'Models', status: 'OK' });
    } catch (err) {
        console.log(`   ${colors.red}✗${colors.reset} Model loading failed: ${err.message}`);
        tests.push({ name: 'Models', status: 'FAILED' });
    }

    // Summary
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}                    TEST SUMMARY${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
    
    tests.forEach(test => {
        const statusColor = test.status === 'OK' ? colors.green : colors.red;
        console.log(`   ${statusColor}${test.status}${colors.reset} - ${test.name}`);
    });

    const passedTests = tests.filter(t => t.status === 'OK').length;
    const totalTests = tests.length;
    
    console.log(`\n${colors.blue}Result: ${passedTests}/${totalTests} tests passed${colors.reset}\n`);

    if (passedTests === totalTests) {
        console.log(`${colors.green}✓ All systems operational!${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`${colors.red}✗ Some tests failed. Please check the errors above.${colors.reset}\n`);
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error(`${colors.red}Test execution failed:${colors.reset}`, err);
    process.exit(1);
});
