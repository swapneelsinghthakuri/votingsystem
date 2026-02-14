// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAv8bamyrsoCdLdPR63CN2qlH_SwD8xMEo",
  authDomain: "fir-voting-system-fb1b8.firebaseapp.com",
  databaseURL: "https://fir-voting-system-fb1b8-default-rtdb.firebaseio.com",
  projectId: "fir-voting-system-fb1b8",
  storageBucket: "fir-voting-system-fb1b8.firebasestorage.app",
  messagingSenderId: "260352762458",
  appId: "1:260352762458:web:0b0ab7cb46156c89f4ee63",
  measurementId: "G-TE2HRKJQCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);