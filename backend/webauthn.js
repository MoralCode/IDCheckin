const express = require('express');
const webauthn = require('webauthn');
const {
  randomBytes,
} = require('node:crypto');


const app = express();
const port = 3000;

app.use(express.json());

// In-memory storage for user data (for demonstration purposes)
const users = {};

// Generate a challenge for WebAuthn registration or authentication
function generateChallenge() {
	return randomBytes(32).toString('base64');
}

// Endpoint for initiating WebAuthn registration
app.post('/register', (req, res) => {
    const userId = req.body.userId;

    if (!users[userId]) {
        users[userId] = { id: userId, credentials: [] };
    }

    const challenge = generateChallenge();
    const user = users[userId];

    // Create options for WebAuthn registration
    const options = {
        publicKey: {
            challenge: Buffer.from(challenge, 'base64'),
            rp: {
                name: 'Your Web Service',
            },
            user: {
                id: Buffer.from(userId),
                name: user.id,
                displayName: user.id,
            },
            pubKeyCredParams: [
                {
                    type: 'public-key',
                    alg: -7, // Use the desired algorithm, -7 represents ES256
                },
            ],
            attestation: 'direct',
            authenticatorSelection: {
                authenticatorAttachment: 'cross-platform',
            },
        },
    };

    // Store the challenge in the session
    user.challenge = challenge;

    // Send the credential options to the client
    res.json(options);
});

// Endpoint for completing WebAuthn registration
app.post('/verify', (req, res) => {
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
