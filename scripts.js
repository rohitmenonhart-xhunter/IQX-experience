document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById('login-button');
    const authContainer = document.getElementById('auth-container');
    const contentContainer = document.getElementById('content');
    const userInfoContainer = document.getElementById('user-info');
    const userNameSpan = document.getElementById('user-name');
    const admissionNumberSpan = document.getElementById('admission-number');
    const apiKeyContainer = document.getElementById('api-key');
    const copyApiKeyButton = document.getElementById('copy-api-key-button');

    // Function to generate a random number within a specified range
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Function to generate API key as dots for security
    function generateApiKey() {
        let apiKey = '';
        do {
            // Generate a random number between 100000 and 9999999999999999
            const randomNumber = getRandomNumber(100000, 9999999999999999);
            // Convert the number to string
            apiKey = randomNumber.toString();
            // Ensure the length is between 7 and 16
        } while (apiKey.length < 7 || apiKey.length > 16 || Number(apiKey.slice(0, 2)) + Number(apiKey.slice(-2)) !== 77);

        return apiKey; // Return actual API key value
    }

    // Function to update API key every 10 seconds
    function updateApiKey() {
        const apiKey = generateApiKey();
        const apiKeyHidden = '*'.repeat(apiKey.length); // Convert API key to dots for security

        // Update the visual representation with dots
        apiKeyContainer.textContent = apiKeyHidden;

        // Store the actual API key value in localStorage
        localStorage.setItem('api_key', apiKey);

        setTimeout(updateApiKey, 10000); // Update every 10 seconds
    }

    // Function to copy API key to clipboard
    // Function to copy API key to clipboard
function copyApiKeyToClipboard() {
    const apiKey = localStorage.getItem('api_key');
    const userDisplayName = userNameSpan.textContent.trim();
    const admissionNumber = admissionNumberSpan.textContent.trim();

    // Create a temporary textarea element to hold the API key
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = apiKey;

    // Append the textarea to the DOM (this is necessary for the copy command to work)
    document.body.appendChild(tempTextArea);

    // Select the text in the textarea
    tempTextArea.select();
    tempTextArea.setSelectionRange(0, 99999); // For mobile devices

    // Copy the selected text to the clipboard
    document.execCommand('copy');

    // Remove the temporary textarea from the DOM
    document.body.removeChild(tempTextArea);

    // Send API key, user name, and admission number to Firebase Realtime Database
    const db = firebase.database();
    db.ref('api_keys').push({
        apiKey: apiKey,
        userName: userDisplayName,
        admissionNumber: admissionNumber,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        alert('API Key copied and details sent to Firebase!');
    }).catch(error => {
        console.error('Error sending data to Firebase:', error);
        alert('Error sending data to Firebase. Please try again.');
    });

    // Inform the user that the key has been copied
    alert("API Key copied to clipboard!");
}


    // Start updating API key
    updateApiKey();

    // Event listener for login button click
    loginButton.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth()
            .signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                const email = user.email;

                // Check if the email ends with 'svce.ac.in'
                if (email.endsWith("@svce.ac.in")) {
                    authContainer.style.display = 'none';
                    contentContainer.style.display = 'block';

                    // Display user information in the hero section
                    userNameSpan.textContent = user.displayName;
                    admissionNumberSpan.textContent = email.split('@')[0];
                    userInfoContainer.style.display = 'block';
                } else {
                    alert("Access restricted to users with email ending in 'svce.ac.in'");
                    firebase.auth().signOut();
                }
            })
            .catch((error) => {
                console.error("Error during sign-in:", error.message);
            });
    });

    // Event listener for copying API key button click
    copyApiKeyButton.addEventListener('click', () => {
        copyApiKeyToClipboard();
    });

    // Firebase auth state change listener
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const email = user.email;
            if (email.endsWith("@svce.ac.in")) {
                authContainer.style.display = 'none';
                contentContainer.style.display = 'block';

                // Display user information in the hero section
                userNameSpan.textContent = user.displayName;
                admissionNumberSpan.textContent = email.split('@')[0];
                userInfoContainer.style.display = 'block';
            } else {
                authContainer.style.display = 'block';
                contentContainer.style.display = 'none';
                userInfoContainer.style.display = 'none';
                firebase.auth().signOut();
            }
        } else {
            authContainer.style.display = 'block';
            contentContainer.style.display = 'none';
            userInfoContainer.style.display = 'none';
        }
    });
});
