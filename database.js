import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "",
    authDomain: "smuacademy-qa-dedup-app.firebaseapp.com",
    projectId: "smuacademy-qa-dedup-app",
    storageBucket: "smuacademy-qa-dedup-app.firebasestorage.app",
    messagingSenderId: "275088381757",
    appId: "1:275088381757:web:ddd13148312872a6711754",
    measurementId: "G-EXC7W0XFCX"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);