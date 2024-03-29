const express = require('express');
const webauthn = require('webauthn');
const crypto = require('crypto');
const base64url = require('base64url');

const app = express();
const port = 3000;

app.use(express.json());

// In-memory storage for user data (for demonstration purposes)
const users = {};

// Generate a challenge for WebAuthn registration or authentication
function generateChallenge() {
    return base64url(crypto.randomBytes(32));
}

// Endpoint for initiating WebAuthn registration
app.post('/register', (req, res) => {
    const userId = req.body.userId;

    if (!users[userId]) {
        users[userId] = { id: userId, credentials: [] };
    }

    const challenge = generateChallenge();
    const user = users[userId];

    // Store the challenge in the session
    user.challenge = challenge;

    // Send the challenge to the client
    res.json({ challenge });
});

// Endpoint for completing WebAuthn registration
app.post('/verify-registration', (req, res) => {
    const userId = req.body.userId;
    const user = users[userId];

    // Verify the WebAuthn registration response
    const { id, rawId, response, type } = req.body;
    const challenge = user.challenge; // Retrieve the challenge from the session

    // Perform your WebAuthn registration verification logic here
    // Make sure to verify the challenge properly

    // For demonstration purposes, assume registration is successful
    user.credentials.push({ id, rawId, response, type });

    // Clear the challenge from the session
    delete user.challenge;

    res.json({ success: true });
});

// Endpoint for completing WebAuthn authentication
app.post('/verify-authentication', (req, res) => {
    const userId = req.body.userId;
    const user = users[userId];

    // Verify the WebAuthn authentication response
    webauthn.verifyAssertionResponse(user.challenge, req.body)
        .then(() => {
            // Clear the challenge from the session
            delete user.challenge;

            res.json({ success: true });
        })
        .catch(error => {
            console.error('WebAuthn authentication failed:', error);
            res.status(400).json({ error: 'WebAuthn authentication failed' });
        });
});

// Endpoint for initiating WebAuthn authentication
app.post('/authenticate', (req, res) => {
    const userId = req.body.userId;
    const user = users[userId];

    if (!user || !user.credentials.length) {
        return res.status(400).json({ error: 'User not registered or no credentials available' });
    }

    const challenge = generateChallenge();

    // Create options for WebAuthn authentication
    const options = {
        publicKey: {
            challenge: Buffer.from(challenge, 'base64'),
            rpId: 'localhost', // Replace with your actual domain
            allowCredentials: user.credentials.map(cred => ({
                type: 'public-key',
                id: cred.rawId,
            })),
            userVerification: 'required',
        },
    };

    // Store the challenge in the session
    user.challenge = challenge;

    // Send the authentication options to the client
    res.json(options);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
