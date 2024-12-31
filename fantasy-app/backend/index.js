const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

const { Pool } = require('pg');
const pool = new Pool({
    user: 'your_username',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});