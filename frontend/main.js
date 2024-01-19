const BASEURL = "http://localhost:3000";

function readNFC() {
    // Simulate reading NFC badge ID (replace this with actual NFC reading logic)
    const badgeId = '123456789';

    // Display badge ID in the input field
    document.getElementById('badgeId').value = badgeId;
}

function fetchUsername() {
    const badgeId = document.getElementById('badgeId').value;

    // Make a GET request to the server to fetch the username
    fetch(BASEURL + `/username/${badgeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Display the username in the result paragraph
            document.getElementById('result').textContent = `Username: ${data.username}`;
        })
        .catch(error => {
            console.error('Error fetching username:', error);
            document.getElementById('result').textContent = 'Error fetching username';
        });
}

function submitAttendance() {
    const badgeId = document.getElementById('badgeId').value;
    const userName = document.getElementById('userName').value;

    // Check if both badge ID and user name are provided
    if (badgeId && userName) {
        // Make an AJAX request to your server to store the data in the database
        // Use an appropriate route on your server to handle this request
        // Example: POST /attendance
        // You'll need to implement the server-side logic using Node.js, Express, and MongoDB
        // Here, I'm using a placeholder URL, replace it with your actual server URL
        const url = BASEURL + '/attendance';

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ badgeId, userName }),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server (success or error)
            console.log(data);
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert('Please provide both badge ID and user name.');
    }
}
