// 引入 Firebase 核心 SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyD-bvmNnYsdEIkkeKPFsEakatlhyRH7xEg",
    authDomain: "meow-e7846.firebaseapp.com",
    projectId: "meow-e7846",
    storageBucket: "meow-e7846.firebasestorage.app",
    messagingSenderId: "743672734125",
    appId: "1:743672734125:web:7d9f6fb1cac5b18ef48124"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);