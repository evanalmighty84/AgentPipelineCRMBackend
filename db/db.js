const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'u8l94tqohpqvhb',
    host: process.env.DB_HOST || 'cet8r1hlj0mlnt.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
    database: process.env.DB_NAME || 'd1abn8jfledmcg',
    password: process.env.DB_PASSWORD || 'p67994c27f42b5d72c372530936b72318824f5861cc47de2759eae8c4b012e43d',
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false },

    // Optional connection pool settings
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
});

// Test connection (runs on server start)
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error acquiring client:', err.stack);
    } else {
        console.log('✅ Successfully connected to Agent Pipeline CRM PostgreSQL database');
    }
    release();
});

module.exports = pool;
