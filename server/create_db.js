const mysql = require('mysql2/promise');

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Mansi@123',
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS idea_generator;`);
        console.log('Database idea_generator checked/created');
        await connection.end();
    } catch (err) {
        console.error('Error creating database:', err);
    }
}

createDatabase();
