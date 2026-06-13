// 1. 引入 Firebase 設定與驗證模組
import { auth } from './firebaseInit.js';
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // 💡 注意：Firebase 登入預設是用 Email。如果你的 username 輸入框平常是讓大家打 Email，這樣就能直接用！
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
        // 🔥 核心改動：改用 Firebase 雲端帳密驗證登入
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("雲端登入成功，使用者資訊:", userCredential.user);

        message.style.color = '#28a745';
        message.innerText = '雲端登入成功，正在導向主頁...';

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error("登入失敗:", error);
        message.style.color = '#dc3545';

        // 簡單的錯誤訊息中文化
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            message.innerText = '帳號或密碼錯誤，請再試一次。';
        } else {
            message.innerText = '登入失敗：' + error.message;
        }
    }
});

// 忘記密碼按鈕保持原樣
document.getElementById('forgot-pw-btn').addEventListener('click', () => {
    alert('喵！忘記密碼請聯繫班級管理員或資訊股長進行重設。');
});

// 🎯 🚀 核心改动：處理 Google 登入回傳的資料，並同步登入 Firebase 雲端
window.handleCredentialResponse = async function (response) {
    const message = document.getElementById('message');
    try {
        // 拿 Google 的憑證去向 Firebase 報到
        const credential = GoogleAuthProvider.credential(response.credential);
        const result = await signInWithCredential(auth, credential);

        console.log("Google 雲端登入成功！", result.user);
        if (message) {
            message.style.color = '#28a745';
            message.innerText = 'Google 登入成功，跳轉中...';
        }

        window.location.href = 'index.html';
    } catch (error) {
        console.error("Google 雲端登入失敗:", error);
        if (message) {
            message.style.color = '#dc3545';
            message.innerText = 'Google 登入失敗：' + error.message;
        }
    }
}