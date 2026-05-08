import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. 初始化 Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD-bvmNnYsdEIkkeKPFsEakatlhyRH7xEg",
    authDomain: "meow-e7846.firebaseapp.com",
    projectId: "meow-e7846",
    appId: "1:743672734125:web:7d9f6fb1cac5b18ef48124"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

let currentSortOrder = 'newest';
let unsubscribe = null; // 用來清除監聽器

// 2. 監聽登入狀態
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("雲端連線成功:", user.email);
        initCloudDisplay(user.email);
    } else {
        window.location.href = 'login.html';
    }
});

// 3. 核心：從雲端即時抓取資料
function initCloudDisplay(userEmail) {
    const listElement = document.getElementById('list');
    if (!listElement) return;

    // 如果之前有監聽器，先關掉它
    if (unsubscribe) unsubscribe();

    // 建立雲端查詢：找 user 是你，並按日期排序
    const q = query(
        collection(db, "transactions"),
        where("user", "==", userEmail),
        orderBy("date", currentSortOrder === 'newest' ? "desc" : "asc")
    );

    // 🚀 onSnapshot 會在資料變動時「自動」更新畫面，不用手動重新整理
    unsubscribe = onSnapshot(q, (snapshot) => {
        listElement.innerHTML = '';
        
        if (snapshot.empty) {
            listElement.innerHTML = `<li style="text-align: center; color: #888; padding: 20px;">📭 雲端目前沒有紀錄。</li>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const t = docSnap.data();
            const id = docSnap.id; // Firebase 的自動 ID
            renderItem(t, id);
        });
    });
}

// 4. 繪製 HTML 畫面
function renderItem(t, id) {
    const listElement = document.getElementById('list');
    const amt = parseFloat(t.amount || 0);
    const displayTitle = t.description || "未命名項目";
    const isIncome = amt >= 0;

    const item = document.createElement('li');
    item.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);";

    item.innerHTML = `
        <div style="display: flex; align-items: center;">
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: bold; color: #999; font-size: 0.8em;">${t.date || '無日期'}</span>
                <span style="font-size: 1.05em; color: #333; font-weight: 500;">${displayTitle}</span>
            </div>
        </div>
        <div style="display: flex; align-items: center;">
            <span style="font-weight: bold; color: ${isIncome ? '#28a745' : '#dc3545'}; font-size: 1.1em; margin-right: 15px;">
                ${isIncome ? '+' : '-'}$${Math.abs(amt).toLocaleString()}
            </span>
            <button onclick="removeTransaction('${id}')" style="background:none; border:none; cursor:pointer; font-size:1.1em; opacity: 0.5;">🗑️</button>
        </div>
    `;
    listElement.appendChild(item);
}

// 5. 雲端刪除功能
window.removeTransaction = async function (id) {
    if (!confirm('確定從雲端永久刪除嗎？')) return;
    try {
        await deleteDoc(doc(db, "transactions", id));
        // 刪除後不需要手動呼叫 init，onSnapshot 會自動處理！
    } catch (e) {
        alert("刪除失敗：" + e.message);
    }
};

// 排序切換
window.sortRecords = function (order) {
    currentSortOrder = order;
    const user = auth.currentUser;
    if (user) initCloudDisplay(user.email);
};