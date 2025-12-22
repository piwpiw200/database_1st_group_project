const express =  require('express');
const User = require('./user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router =  express.Router();

const JWT_SECRET = process.env.JWT_SECRET_KEY

router.post("/admin", async (req, res) => {
    const {username, password} = req.body;
    try {
        const db = require('../utils/db');
        // If DB not connected, allow an env-based offline admin login (portable)
        if (!db.isConnected()) {
            const envEmail = process.env.ADMIN_EMAIL;
            const envPass = process.env.ADMIN_PASSWORD;
            // Only allow offline env-based admin if both env vars are explicitly provided
            if (envEmail && envPass && username === envEmail && password === envPass) {
                const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
                return res.status(200).json({ message: 'Authentication successful (offline)', token, user: { username, role: 'admin' } });
            }
            return res.status(503).send({ message: 'DB not connected — admin login unavailable in offline mode' });
        }

        const admin = await User.findOne({ username });
        if (!admin) {
            return res.status(404).send({ message: 'Admin not found!' })
        }

        // Passwords are stored hashed by the model pre-save. Support legacy plaintext passwords too.
        const stored = admin.password || '';
        let passwordMatches = false;
        if (typeof stored === 'string' && stored.startsWith('$2')) {
            passwordMatches = await bcrypt.compare(password, stored);
        } else {
            // legacy plaintext match
            passwordMatches = (stored === password);
            // if it matches, re-hash and store securely
            if (passwordMatches) {
                try {
                    admin.password = await bcrypt.hash(password, 10);
                    await admin.save();
                } catch (e) {
                    console.warn('Failed to re-hash legacy password for admin:', e.message);
                }
            }
        }

        if (!passwordMatches) {
            return res.status(401).send({ message: 'Invalid password!' })
        }

        const token =  jwt.sign(
            {id: admin._id, username: admin.username, role: admin.role}, 
            JWT_SECRET,
            {expiresIn: "1h"}
        )

        return res.status(200).json({
            message: "Authentication successful",
            token: token,
            user: {
                username: admin.username,
                role: admin.role
            }
        })
        
    } catch (error) {
       console.error("Failed to login as admin", error)
       res.status(401).send({message: "Failed to login as admin"}) 
    }
})

module.exports = router;