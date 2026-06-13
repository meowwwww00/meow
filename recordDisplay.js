// 1. 引入 Firebase 核心套件 (請確保路徑與你的 firebaseInit.js 一致)
import { auth, db } from './firebaseInit.js';
import { collection, query, where, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let currentSortOrder = 'newest';
let allTransactions = []; // 儲存從雲端抓下來的即時資料庫快照

// 🎯 核心變更：監聽使用者登入狀態，登入成功就立刻啟動雲端實時監聽
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("使用者已登入，開始同步雲端資料:", user.uid);
        startListeningTransactions(user.uid);
    } else {
        console.log("未登入，導向登入頁面");
        window.location.href = 'login.html';
    }
});

// 🎯 核心變更：實時監聽 Firebase 資料庫變動
function startListeningTransactions(uid) {
    // 假設你在 Firestore 的集合名稱叫做 "transactions"，並且新增紀錄時有存入 "uid" 欄位
    const q = query(collection(db, "transactions"), where("uid", "==", uid));

    // onSnapshot 是神奇監聽器：雲端資料一有增刪改，這裡就會自動觸發更新全台裝置
    onSnapshot(q, (snapshot) => {
        allTransactions = [];
        snapshot.forEach((doc) => {
            allTransactions.push({
                id: doc.id,       // Firestore 的文件 ID
                ...doc.data()     // 紀錄的詳細內容 (date, amount, text, receipt...)
            });
        });

        // 抓到新資料後，立刻渲染畫面
        renderList();
    }, (error) => {
        console.error("雲端即時同步失敗:", error);
    });
}

// 🎯 負責將資料進行「篩選」、「排序」並渲染到畫面上
function renderList(sortOrder = currentSortOrder) {
    currentSortOrder = sortOrder;
    const listElement = document.getElementById('list');
    if (!listElement) return;

    let transactions = [...allTransactions];

    // 🚀 區間篩選邏輯
    const startDate = document.getElementById('start-date') ? document.getElementById('start-date').value : '';
    const endDate = document.getElementById('end-date') ? document.getElementById('end-date').value : '';

    if (startDate || endDate) {
        transactions = transactions.filter(t => {
            const itemDate = t.date;
            const isAfterStart = startDate ? itemDate >= startDate : true;
            const isBeforeEnd = endDate ? itemDate <= endDate : true;
            return isAfterStart && isBeforeEnd;
        });
    }

    // 排序邏輯
    transactions.sort((a, b) => {
        return sortOrder === 'newest'
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
    });

    listElement.innerHTML = '';

    // 承接上次修改：無紀錄時文字靠左
    if (transactions.length === 0) {
        listElement.innerHTML = `<li style="text-align: left; color: #888; padding: 20px 0;">📭 目前沒有任何紀錄。</li>`;
        return;
    }

    // 渲染每筆交易明細
    transactions.forEach(t => {
        const amt = parseFloat(t.amount || t.money || t.amt || 0);
        let displayTitle = t.text || t.description || t.desc || "未命名項目";

        const receiptHtml = t.receipt
            ? `<img src="${t.receipt}" onclick="viewFullImage('${t.receipt}')" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px; cursor: pointer; border: 1px solid #eee;" alt="縮圖">`
            : `<div style="width: 50px; height: 50px; margin-right: 12px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 10px;">無圖</div>`;

        const item = document.createElement('li');
        item.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);";

        const isIncome = amt >= 0;
        item.innerHTML = `
            <div style="display: flex; align-items: center;">
                ${receiptHtml}
                <div style="display: flex; flex-direction: column; text-align: left;">
                    <span style="font-weight: bold; color: #999; font-size: 0.8em;">${t.date || '無日期'}</span>
                    <span style="font-size: 1.05em; color: #333; font-weight: 500;">${displayTitle}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: ${isIncome ? '#28a745' : '#dc3545'}; font-size: 1.1em; margin-right: 15px;">
                    ${isIncome ? '+' : '-'}$${Math.abs(amt).toLocaleString()}
                </span>
                <button onclick="editTransaction('${t.id}')" style="background:none; border:none; cursor:pointer; font-size:1.1em; margin-right: 10px; opacity: 0.7;">✏️</button>
                <button onclick="removeTransaction('${t.id}')" style="background:none; border:none; cursor:pointer; font-size:1.1em; filter: grayscale(1); opacity: 0.5;">🗑️</button>
            </div>
        `;
        listElement.appendChild(item);
    });
}

// 網頁載入時綁定按鈕事件 (不再主動呼叫 init，改由 auth 狀態主導)
window.addEventListener('load', () => {
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            renderList(currentSortOrder);
        });
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('start-date').value = '';
            document.getElementById('end-date').value = '';
            renderList(currentSortOrder);
        });
    }
});

// 🚀 核心變更：刪除功能直接同步雲端
window.removeTransaction = async function (id) {
    if (!confirm('確定刪除這筆紀錄嗎？')) return;
    try {
        // 直接刪除雲端對應 ID 的文件，onSnapshot 會即時通知全裝置，畫面會自動更新！
        await deleteDoc(doc(db, "transactions", id));
        console.log("雲端紀錄刪除成功！");
    } catch (error) {
        alert("刪除失敗，請檢查網路連線：" + error.message);
    }
};

window.editTransaction = function (id) {
    window.location.href = `edit.html?id=${id}`;
};

window.viewFullImage = function (base64Data) {
    const newTab = window.open();
    newTab.document.body.innerHTML = `
        <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#000;">
            <img src="${base64Data}" style="max-width:100%; max-height:100vh; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
        </body>`;
};

window.sortRecords = function (order) {
    renderList(order);
};

window.remindToLine = function () {
    const amountInput = document.getElementById('remind-amount');
    const amount = amountInput ? amountInput.value.trim() : '';
    let message = "";
    let confirmPrompt = "";

    if (amount && !isNaN(amount)) {
        message = `📢 【班費繳交提醒】\n各位同學，本次需繳交班費 $${parseFloat(amount).toLocaleString()} 元，請儘速找總務股長繳交，謝謝大家！🙏`;
        confirmPrompt = `即將發送金額 $${amount} 元的催繳通知，確定開啟 Line 分享嗎？`;
    } else {
        message = "📢 【班費繳交提醒】\n各位同學，請記得繳交本次班費！🙏";
        confirmPrompt = "即將開啟 Line 分享，請選擇要發送的班級群組。";
    }

    const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(message)}`;
    if (confirm(confirmPrompt)) {
        window.open(lineUrl, '_blank');
        if (amountInput) amountInput.value = '';
    }
};