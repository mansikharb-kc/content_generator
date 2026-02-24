const mysql = require('mysql2/promise');

async function testLocalMySQL() {
    console.log("--- Testing Local MySQL (Mansi@123) ---");
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Mansi@123',
        });
        console.log("✅ Successfully connected to Local MySQL!");
        const [rows] = await connection.query('SHOW DATABASES;');
        console.log("Databases:", rows.map(r => r.Database).join(', '));
        await connection.end();
    } catch (err) {
        console.error("❌ Local MySQL Connection Failed!");
        console.error(err.message);
    }
}

testLocalMySQL();
