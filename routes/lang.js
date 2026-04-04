const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Get raw JSON dictionary
router.get('/dict/:locale', (req, res) => {
    try {
        const locale = req.params.locale;
        const dictPath = path.join(__dirname, '../locales', `${locale}.json`);
        if (fs.existsSync(dictPath)) {
            const data = fs.readFileSync(dictPath, 'utf8');
            return res.json(JSON.parse(data));
        }
        res.status(404).json({ error: 'Locale not found' });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Set language cookie via AJAX
router.post('/set', express.json(), (req, res) => {
    const locale = req.body.lang;
    if (locale) {
        res.cookie('lang', locale, { maxAge: 1000 * 60 * 60 * 24 * 365, sameSite: 'lax' });
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

router.get('/:locale', (req, res) => {
    const locale = req.params.locale;
    res.cookie('lang', locale, { maxAge: 1000 * 60 * 60 * 24 * 365, sameSite: 'lax' });
    
    // Redirect back to where the user came from
    const backURL = req.header('Referer') || '/';
    res.redirect(backURL);
});

module.exports = router;
