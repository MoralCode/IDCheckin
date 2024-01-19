const express = require('express');
const webauthn = require('webauthn');

const app = express();
const port = 3000;

app.use(express.json());

// In-memory storage for user data (for demonstration purposes)
const users = {};

// Generate a challenge for WebAuthn registration or authentication
function generateChallenge() {
    return webauthn.generateAttestationChallenge();
}

// Endpoint for initiating WebAuthn registration
app.post('/register', (req, res) => {
    const userId = req.body.userId;

    if (!users[userId]) {
        users[userId] = { id: userId, credentials: [] };
    }

    const challenge = generateChallenge();
    const user = users[userId];

    // Create a credential options object for the user
    const credentialCreationOptions = webauthn.generateAttestationOptions({
        userId: user.id,
        userName: user.id,
        displayName: user.id,
        attestationType: 'direct',
    });

    // Store the challenge in the session
    user.challenge = challenge;

    // Send the credential options to the client
    res.json(credentialCreationOptions);
});

// Endpoint for completing WebAuthn registration
app.post('/verify-registration', (req, res) => {
    const userId = req.body.userId;
    const user = users[userId];

    // Verify the WebAuthn registration response
    webauthn.verifyAttestationResponse(user.challenge, req.body)
        .then(credentialInfo => {
            // Store the credential in the user's credentials array
            user.credentials.push(credentialInfo);

            // Clear the challenge from the session
            delete user.challenge;

            res.json({ success: true });
        })
        .catch(error => {
            console.error('WebAuthn registration failed:', error);
            res.status(400).json({ error: 'WebAuthn registration failed' });
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

    // Create a credential options object for the user
    const credentialRequestOptions = webauthn.generateAssertionOptions({
        userId: user.id,
        challenge,
        allowCredentials: user.credentials.map(cred => ({
            type: cred.rawId,
            id: cred.rawId,
            transports: ['usb', 'nfc', 'ble'],
        })),
    });

    // Store the challenge in the session
    user.challenge = challenge;

    // Send the credential options to the client
    res.json(credentialRequestOptions);
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
