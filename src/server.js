const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (Frontend)
app.use(express.static(path.join(__dirname, '../public')));

// API Endpoints

// Contact Form Submission
app.post('/api/contact', (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    const sql = `INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, phone, message], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error.' });
        }
        res.json({ message: 'Contact request submitted successfully!', id: this.lastID });
    });
});

// Service Enquiry Submission
app.post('/api/enquiry', (req, res) => {
    const { name, email, service, details } = req.body;

    if (!name || !email || !service) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    const sql = `INSERT INTO enquiries (name, email, service, details) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, service, details], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error.' });
        }
        res.json({ message: 'Service enquiry submitted successfully!', id: this.lastID });
    });
});

// Admin endpoint to view contacts (Simple implementation for demo)
app.get('/api/admin/contacts', (req, res) => {
    const sql = `SELECT * FROM contacts ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the website.`);
});
