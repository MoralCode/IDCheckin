const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

// Connect to SQLite database (creates a new file named 'attendance.db' in the project folder)
const db = new sqlite3.Database('attendance.db');

// Create 'attendance' table if it doesn't exist
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS attendance (badgeId TEXT, userName TEXT)');
});

// Use the cors middleware to enable CORS
app.use(cors());

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


// Endpoint to get username by badge ID
app.get('/username/:badgeId', (req, res) => {
    const { badgeId } = req.params;

    // Query the 'attendance' table for the username associated with the badge ID
    db.get('SELECT userName FROM attendance WHERE badgeId = ?', [badgeId], (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ error: 'Error querying database' });
        } else {
            if (row) {
                res.json({ username: row.userName });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
