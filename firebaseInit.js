// 引入 Firebase 核心 SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ 請把這裡替換成你自己在 Firebase 網頁後台申請到的金鑰配置！
const firebaseConfig = {
    apiKey: "AIzaSyD-bvmNnYsdEIkkeKPFsEakatlhyRH7xEg",
    authDomain: "meow-e7846.firebaseapp.com",
    projectId: "meow-e7846",
    storageBucket: "meow-e7846.firebasestorage.app",
    messagingSenderId: "743672734125",
    appId: "1:743672734125:web:7d9f6fb1cac5b18ef48124"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出給 script.js, recordDisplay.js, login.js 使用
export const auth = getAuth(app);
export const db = getFirestore(app);