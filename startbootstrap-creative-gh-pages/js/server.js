const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual Google Client ID
const googleClientId = '692401563428-59hr15ju24ggl3n977mu33gdt2e3o9pl.apps.googleusercontent.com';

app.get('/api/config', (req, res) => {
    res.json({ clientId: googleClientId });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
