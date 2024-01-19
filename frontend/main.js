document.addEventListener('DOMContentLoaded', function () {
    // Function to handle NFC reading (simulate with a button click for demo purposes)
    document.querySelector('button').addEventListener('click', readNFC);
});

function readNFC() {
    // Simulate reading NFC badge ID (replace this with actual NFC reading logic)
    const badgeId = '123456789';

    // Display badge ID in the input field
    document.getElementById('badgeId').value = badgeId;
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
        const url = 'http://your-server-url/attendance';

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
