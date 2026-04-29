import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. 初始化 Firebase (請確認與你 login.html 用的 config 一致)
const firebaseConfig = {
    apiKey: "AIzaSyD-bvmNnYsdEIkkeKPFsEakatlhyRH7xEg",
    authDomain: "meow-e7846.firebaseapp.com",
    projectId: "meow-e7846",
    appId: "1:743672734125:web:7d9f6fb1cac5b18ef48124"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// 2. 監聽登入狀態並抓取雲端資料
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("登入成功，正在抓取雲端資料:", user.email);
        startListening(user.email); // 啟動即時同步
    } else {
        window.location.href = 'login.html';
    }
});

// 3. 🚀 雲端即時同步邏輯 (取代原本的 localStorage 邏輯)
function startListening(userEmail) {
    const listElement = document.getElementById('list');
    
    // 設定查詢條件：找 user 欄位等於當前登入者 Email 的紀錄
    const q = query(
        collection(db, "transactions"), 
        where("user", "==", userEmail),
        orderBy("date", "desc") // 預設按日期排序
    );

    // 每當雲端資料變動，這裡會自動重新渲染
    onSnapshot(q, (snapshot) => {
        listElement.innerHTML = '';
        if (snapshot.empty) {
            listElement.innerHTML = `<li style="text-align: center; color: #888; padding: 20px;">📭 目前雲端沒有任何紀錄。</li>`;
            return;
        }

        snapshot.forEach((doc) => {
            const t = doc.data();
            renderItem(t, doc.id); // 呼叫下方畫面的顯示函式
        });
    });
}

// 4. 渲染畫面的函式 (把原本 forEach 裡面的 HTML 搬過來)
function renderItem(t, docId) {
    const listElement = document.getElementById('list');
    const amt = parseFloat(t.amount || 0);
    const isIncome = amt >= 0;
    const item = document.createElement('li');
    item.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);";

    item.innerHTML = `
        <div style="display: flex; align-items: center;">
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: bold; color: #999; font-size: 0.8em;">${t.date || '無日期'}</span>
                <span style="font-size: 1.05em; color: #333; font-weight: 500;">${t.description || "未命名項目"}</span>
            </div>
        </div>
        <div style="display: flex; align-items: center;">
            <span style="font-weight: bold; color: ${isIncome ? '#28a745' : '#dc3545'}; font-size: 1.1em;">
                ${isIncome ? '+' : '-'}$${Math.abs(amt).toLocaleString()}
            </span>
        </div>
    `;
    listElement.appendChild(item);
}