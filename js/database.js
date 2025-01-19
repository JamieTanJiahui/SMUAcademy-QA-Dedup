import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc ,query, where } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDd0BwMyxMetApWJcJF34-7_cqeUVeZcoA",
  authDomain: "smuacademy-qa-dedup-app.firebaseapp.com",
  projectId: "smuacademy-qa-dedup-app",
  storageBucket: "smuacademy-qa-dedup-app.firebasestorage.app",
  messagingSenderId: "275088381757",
  appId: "1:275088381757:web:ddd13148312872a6711754",
  measurementId: "G-EXC7W0XFCX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export {getFirestore, collection, doc, setDoc, getDocs, getDoc, query, where } 