import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Firebase 配置 (請確保與你的專案一致)
const firebaseConfig = {
    apiKey: "AIzaSyD-bvmNnYsdEIkkeKPFsEakatlhyRH7xEg",
    authDomain: "meow-e7846.firebaseapp.com",
    projectId: "meow-e7846",
    storageBucket: "meow-e7846.firebasestorage.app",
    appId: "1:743672734125:web:7d9f6fb1cac5b18ef48124"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM 元素
const balanceDisplay = document.getElementById('balance');
const form = document.getElementById('add-transaction-form');
const fileNameDisplay = document.getElementById('file-name-display');

// 2. 監聽登入狀態與「即時更新餘額」
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('display-username').innerText = user.email;
        startBalanceListener(user.email); // 啟動雲端監聽
    } else {
        window.location.href = 'login.html';
    }
});

// 3. 核心功能：從雲端抓取資料並計算總額
function startBalanceListener(userEmail) {
    const q = query(collection(db, "transactions"), where("user", "==", userEmail));
    
    // 只要雲端有任何變動，這邊會自動重新計算，不用存 localStorage
    onSnapshot(q, (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
            const data = doc.data();
            total += parseFloat(data.amount || 0);
        });
        
        if (balanceDisplay) {
            balanceDisplay.innerText = `$${total.toLocaleString()}`;
            balanceDisplay.style.color = (total >= 0) ? '#28a745' : '#dc3545';
        }
    });
}

// 4. 核心功能：將新資料存入 Firebase
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user) return alert("請先登入！");

        const description = document.getElementById('description').value;
        const amountInput = document.getElementById('amount').value;
        const date = document.getElementById('date').value;
        const type = document.getElementById('type').value;
        const receiptInput = document.getElementById('receipt');

        let amount = parseFloat(amountInput);
        if (type === 'expense') amount = -Math.abs(amount);

        // 處理照片轉 Base64
        let receiptBase64 = null;
        if (receiptInput.files[0]) {
            receiptBase64 = await toBase64(receiptInput.files[0]);
        }

        try {
            // 🚀 關鍵：把資料送上雲端
            await addDoc(collection(db, "transactions"), {
                description,
                amount,
                date,
                receipt: receiptBase64,
                user: user.email, // 綁定帳號，這是私人帳本的關鍵
                createdAt: serverTimestamp()
            });

            alert('✅ 成功存入雲端資料庫！即使清理快取資料也不會不見了。');
            form.reset();
            if (fileNameDisplay) fileNameDisplay.innerText = '未選擇任何檔案';
        } catch (error) {
            console.error("雲端存檔失敗:", error);
            alert("存檔失敗，請檢查網路！");
        }
    });
}

// 輔助函式
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// 登出
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        });
    });
}