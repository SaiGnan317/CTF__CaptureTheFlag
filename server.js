const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static('public'));

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        token TEXT UNIQUE,
        score INTEGER DEFAULT 0,
        total_time_ms INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER,
        name TEXT,
        usn TEXT,
        FOREIGN KEY(team_id) REFERENCES teams(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS team_challenges (
        team_id INTEGER,
        challenge_id INTEGER,
        start_time INTEGER,
        end_time INTEGER,
        time_taken_ms INTEGER,
        solved BOOLEAN DEFAULT 0,
        PRIMARY KEY (team_id, challenge_id)
    )`);
});

// BROWSER-ONLY FLAGS
const FLAGS = {
    1: 'FLAG{html_inspector_master}',
    2: 'FLAG{SHIFT_CIPHER}',
    3: 'FLAG{11162}',
    4: 'FLAG{log_analysis_complete}'
};

const auth = (req, res, next) => {
    const token = req.cookies.team_token || req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    db.get('SELECT * FROM teams WHERE token = ?', [token], (err, team) => {
        if (err || !team) return res.status(401).json({ error: 'Invalid token' });
        req.team = team;
        next();
    });
};

app.post('/api/register', (req, res) => {
    const { teamName, members } = req.body;
    if (!teamName || !members || members.length === 0 || members.length > 5) {
        return res.status(400).json({ error: 'Invalid data' });
    }
    
    const token = uuidv4();
    db.run('INSERT INTO teams (name, token) VALUES (?, ?)', [teamName, token], function(err) {
        if (err) return res.status(400).json({ error: 'Team name already exists' });
        const teamId = this.lastID;
        
        const stmt = db.prepare('INSERT INTO members (team_id, name, usn) VALUES (?, ?, ?)');
        members.forEach(m => stmt.run(teamId, m.name, m.usn));
        stmt.finalize();
        
        res.cookie('team_token', token, { httpOnly: false, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ success: true, token });
    });
});

app.get('/api/me', auth, (req, res) => {
    db.all('SELECT name, usn FROM members WHERE team_id = ?', [req.team.id], (err, members) => {
        res.json({ team: req.team, members });
    });
});

app.get('/api/challenges', auth, (req, res) => {
    db.all('SELECT challenge_id, start_time, end_time, solved, time_taken_ms FROM team_challenges WHERE team_id = ?', [req.team.id], (err, challenges) => {
        res.json({ challenges: challenges || [] });
    });
});

app.post('/api/start-challenge/:id', auth, (req, res) => {
    const cid = parseInt(req.params.id);
    if (!FLAGS[cid]) return res.status(404).json({ error: 'Challenge not found' });
    
    db.get('SELECT * FROM team_challenges WHERE team_id = ? AND challenge_id = ?', [req.team.id, cid], (err, row) => {
        if (!row) {
            const startTime = Date.now();
            db.run('INSERT INTO team_challenges (team_id, challenge_id, start_time, solved) VALUES (?, ?, ?, 0)', [req.team.id, cid, startTime]);
            res.json({ success: true, start_time: startTime });
        } else {
            res.json({ success: true, start_time: row.start_time });
        }
    });
});

app.post('/api/submit-flag/:id', auth, (req, res) => {
    const cid = parseInt(req.params.id);
    const { flag, penalty_ms } = req.body;
    
    if (FLAGS[cid] !== flag) return res.status(400).json({ error: 'Incorrect flag' });
    
    db.get('SELECT * FROM team_challenges WHERE team_id = ? AND challenge_id = ?', [req.team.id, cid], (err, row) => {
        if (!row) return res.status(400).json({ error: 'Challenge not started yet!' });
        if (row.solved) return res.status(400).json({ error: 'Challenge already solved!' });
        
        const penalty = parseInt(penalty_ms) || 0;
        const endTime = Date.now();
        const timeTaken = (endTime - row.start_time) + penalty;
        
        db.run('UPDATE team_challenges SET end_time = ?, time_taken_ms = ?, solved = 1 WHERE team_id = ? AND challenge_id = ?', 
            [endTime, timeTaken, req.team.id, cid], () => {
                db.run('UPDATE teams SET score = score + 1, total_time_ms = total_time_ms + ? WHERE id = ?', [timeTaken, req.team.id]);
                res.json({ success: true, message: 'Correct Flag!', time_taken_ms: timeTaken });
        });
    });
});

app.post('/api/reset-challenge/:id', auth, (req, res) => {
    const cid = parseInt(req.params.id);
    db.get('SELECT solved FROM team_challenges WHERE team_id = ? AND challenge_id = ?', [req.team.id, cid], (err, row) => {
        if (!row) return res.status(400).json({ error: 'Challenge not started.' });
        if (row.solved) return res.status(400).json({ error: 'Cannot reset a solved challenge.' });
        
        db.run('DELETE FROM team_challenges WHERE team_id = ? AND challenge_id = ?', [req.team.id, cid], function(err) {
            if (err) return res.status(500).json({ error: 'Failed to reset.' });
            res.json({ success: true, message: 'Timer reset successfully.' });
        });
    });
});

app.get('/api/leaderboard', (req, res) => {
    db.all('SELECT id, name, score, total_time_ms FROM teams ORDER BY score DESC, total_time_ms ASC', (err, teams) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        db.all('SELECT team_id, name, usn FROM members', (err, members) => {
            const teamsWithMembers = teams.map(t => ({
                ...t,
                members: members.filter(m => m.team_id === t.id)
            }));
            res.json({ leaderboard: teamsWithMembers });
        });
    });
});

// C1: Verify HTML inspection logic
app.post('/api/challenge1-login', (req, res) => {
    const { role } = req.body;
    if (role === 'admin') {
        res.json({ success: true, message: 'Admin access granted. Secret Payload: FLAG{html_inspector_master}' });
    } else {
        res.status(403).json({ error: 'Access Denied. Role is set to guest.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[+] Browser-Only CTF Server running on port ${PORT}`);
});
