// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDzBv37v0XaU-7nn3R1tHCsKEH_HcVNEHM",
    authDomain: "angga1.firebaseapp.com",
    databaseURL: "https://angga1-default-rtdb.firebaseio.com",
    projectId: "angga1",
    storageBucket: "angga1.appspot.com",
    messagingSenderId: "280982190589",
    appId: "1:280982190589:web:5fe33f8e2db62dafeac194",
    measurementId: "G-RNE9YRDV4P"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;
