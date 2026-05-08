import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. 初始化 Firebase (請確保這組 config 跟你的專案一致)
const firebaseConfig = {
    apiKey: "AIzaSyD-bvmNnYsdEIkkeKPFsEakatlhyRH7xEg",
    authDomain: "meow-e7846.firebaseapp.com",
    projectId: "meow-e7846",
    appId: "1:743672734125:web:7d9f6fb1cac5b18ef48124"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- A. 處理帳號密碼登入 ---
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim(); // 確保 ID 與 HTML 一致 // 這裡建議 HTML 的 ID 改成 email
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    // 🚀 改用 Firebase 雲端驗證，不再用 localStorage.getItem('users')
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            message.style.color = '#28a745';
            message.innerText = '雲端登入成功，正在導向...';
            setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        })
        .catch((error) => {
            message.style.color = '#dc3545';
            message.innerText = '登入失敗：' + error.message;
        });
});

// --- B. 處理 Google 登入 (這才是正確的雲端對接) ---
window.handleCredentialResponse = function(response) {
    const credential = GoogleAuthProvider.credential(response.credential);
    
    // 🚀 告訴 Firebase：這個人拿 Google 憑證來了，請讓他登入雲端
    signInWithCredential(auth, credential)
        .then((result) => {
            console.log("Google 雲端登入成功！", result.user.email);
            window.location.href = 'index.html';
        })
        .catch((error) => {
            alert("Google 登入失敗：" + error.message);
        });
}