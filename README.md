# Firebase Profile Demo (HTML/JS)

A minimal demo project for a university presentation. It shows how **Firebase Authentication**, **Cloud Firestore**, and **Cloud Storage** work together to create a simple user profile feature.

## ✨ Features

* **Sign Up / Log In** (Firebase Authentication)
* **Edit Profile** (e.g., username, bio) (Cloud Firestore)
* **Upload Profile Picture** (Cloud Storage)

## 🔧 Tech Stack

* HTML
* CSS
* Vanilla JavaScript (ES6+)
* Firebase (Auth, Firestore, Storage)

## 🚀 Setup

1.  **Clone the repo:**
    ```sh
    git clone [your-repo-url]
    cd [your-repo-name]
    ```

2.  **Create a Firebase Project:**
    * Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    * Add a Web App (`</>`) to get your `firebaseConfig` object.

3.  **Connect Firebase:**
    * Create a `firebase-config.js` file.
    * Paste your config object into it:
        ```javascript
        // firebase-config.js
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_SENDER_ID",
          appId: "YOUR_APP_ID"
        };
        
        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        
        // Export services
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();
        ```
    * Include this script in your `index.html` file *before* your main script.

4.  **Enable Services in Console:**
    * **Authentication:** Enable the `Email/Password` provider.
    * **Firestore:** Create a database (use `test mode` for the demo).
    * **Storage:** Click "Get Started" to activate.

5.  **Run:**
    * Open `index.html` in your browser (using a local server like VS Code's "Live Server" is recommended).
