import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBGnAlqdPTeBGNwbQBWihvNhae9U8gFG68",
    authDomain: "accessibility-analyser.firebaseapp.com",
    projectId: "accessibility-analyser",
    storageBucket: "accessibility-analyser.firebasestorage.app",
    messagingSenderId: "1030346204043",
    appId: "1:1030346204043:web:01b0830cb20de97cda858e",
    measurementId: "G-V9H744B2WQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);