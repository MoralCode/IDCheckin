const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Replace 'your-database-url' with your actual MongoDB database URL
mongoose.connect('mongodb://your-database-url/attendance', { useNewUrlParser: true, useUnifiedTopology: true });

const attendanceSchema = new mongoose.Schema({
    badgeId: String,
    userName: String,
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

app.use(bodyParser.json());

app.post('/attendance', (req, res) => {
    const { badgeId, userName } = req.body;

    // Create a new attendance record
    const attendance = new Attendance({
        badgeId,
        userName,
    });

    // Save the record to the database
    attendance.save((err) => {
        if (err) {
            console.error('Error saving attendance:', err);
            res.status(500).json({ error: 'Error saving attendance' });
        } else {
            console.log('Attendance saved successfully');
            res.json({ success: true });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
