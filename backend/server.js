const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Connect to SQLite database (creates a new file named 'attendance.db' in the project folder)
const db = new sqlite3.Database('attendance.db');

// Create 'attendance' table if it doesn't exist
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS attendance (badgeId TEXT, userName TEXT)');
});

app.use(bodyParser.json());

app.post('/attendance', (req, res) => {
    const { badgeId, userName } = req.body;

    // Insert a new attendance record into the 'attendance' table
    const stmt = db.prepare('INSERT INTO attendance VALUES (?, ?)');
    stmt.run(badgeId, userName);
    stmt.finalize();

    console.log('Attendance saved successfully');

    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
