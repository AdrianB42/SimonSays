import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";



const firebaseConfig = {
    apiKey: "AIzaSyAfwKbhK-y4g-j7aZkZ-A0MnQnyoSLKiY4",
    authDomain: "numbers-28489.firebaseapp.com",
    projectId: "numbers-28489",
    storageBucket: "numbers-28489.firebasestorage.app",
    messagingSenderId: "708581746277",
    appId: "1:708581746277:web:bf633b4cd5f14228d7088c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// Initialize Firebase services
const auth = getAuth(app); // Firebase Authentication
const db = getFirestore(app); // Firestore Database

export { auth, db };

