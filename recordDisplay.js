// --- [新加入] 引入 Firebase 模組 ---
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- [你的邏輯] 保留原本的變數 ---
const currentUser = localStorage.getItem('currentUser');
const storageKey = currentUser ? `transactions_${currentUser}` : 'transactions';

// --- [新功能] 從 Firebase 讀取資料 ---
async function getRecordsFromFirebase() {
    try {
        const q = query(collection(db, "transactions"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const records = [];
        querySnapshot.forEach((docSnapshot) => {
            records.push({ id: docSnapshot.id, ...docSnapshot.data() });
        });
        return records;
    } catch (e) {
        console.error("Firebase 讀取失敗:", e);
        return [];
    }
}

// --- [整合優化] 初始化頁面顯示 ---
async function initRecordDisplay(sortOrder = 'newest') {
    const listElement = document.getElementById('list');
    if (!listElement) {
        console.error("錯誤：找不到 id 為 'list' 的元素！");
        return;
    }

    listElement.innerHTML = '<li style="text-align: center; color: #888; padding: 20px;">喵嗚加載中...🐾</li>';

    // 🚀 改為從 Firebase 抓資料
    let transactions = await getRecordsFromFirebase();

    // 排序邏輯 (延用你的邏輯)
    transactions.sort((a, b) => {
        return sortOrder === 'newest'
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
    });

    listElement.innerHTML = ''; 

    if (transactions.length === 0) {
        listElement.innerHTML = `<li style="text-align: center; color: #888; padding: 20px;">📭 雲端目前沒有任何紀錄。</li>`;
        return;
    }

    // --- [你的邏輯] 渲染資料與 UI 結構 ---
    transactions.forEach(t => {
        const amt = parseFloat(t.amount || t.money || 0);
        let displayTitle = t.text || t.desc || t.description || "未命名項目";

        const item = document.createElement('li');
        item.style.cssText = "display: flex; justify-content: space-between; padding: 15px; margin-bottom: 10px; background: white; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";

        const isIncome = amt >= 0;
        item.innerHTML = `
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: bold; color: #666; font-size: 0.85em;">${t.date || '無日期'}</span>
                <span style="font-size: 1.1em; color: #333;">${displayTitle}</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: ${isIncome ? '#28a745' : '#dc3545'}; font-size: 1.1em; margin-right: 15px;">
                    ${isIncome ? '+' : ''}$${Math.abs(amt).toLocaleString()}
                </span>
                <button onclick="removeTransaction('${t.id}')" style="background:none; border:none; cursor:pointer; font-size:1.1em;">🗑️</button>
            </div>
        `;
        listElement.appendChild(item);
    });
}

// --- [新功能] 雲端刪除功能 ---
window.removeTransaction = async (id) => {
    if (!confirm('確定要從雲端刪除這筆紀錄嗎？')) return;
    try {
        await deleteDoc(doc(db, "transactions", id));
        initRecordDisplay(); // 刷新
    } catch (e) {
        alert("刪除失敗");
    }
};

// --- [你的邏輯] 統計計算與 Line 提醒 ---
window.calculateMonthlyStats = async () => {
    const transactions = await getRecordsFromFirebase();
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        const amt = parseFloat(t.amount || 0);
        if (amt > 0) income += amt;
        else expense += Math.abs(amt);
    });

    const balance = income - expense;
    document.getElementById('monthly-income').innerText = `+$${income.toLocaleString()}`;
    document.getElementById('monthly-expense').innerText = `-$${expense.toLocaleString()}`;
    const balEl = document.getElementById('monthly-balance');
    if (balEl) {
        balEl.innerText = `$${balance.toLocaleString()}`;
        balEl.style.color = balance >= 0 ? '#28a745' : '#dc3545';
    }
};

window.remindToLine = () => {
    const message = "📢 【班費繳交提醒】\n各位同學，目前的班費帳目已更新，請點擊連結查看最新結餘！🙏";
    const lineUrl = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(message)}`;
    if (confirm("即將開啟 Line 分享，請選擇要發送的班級群組。")) {
        window.open(lineUrl, '_blank');
    }
};

// --- [你的邏輯] 排序與重置接口 ---
window.sortRecords = (order) => initRecordDisplay(order);
window.resetFilter = () => {
    const filter = document.getElementById('date-filter');
    if (filter) filter.value = '';
    initRecordDisplay();
};

// 頁面載入執行
window.addEventListener('load', () => initRecordDisplay());
