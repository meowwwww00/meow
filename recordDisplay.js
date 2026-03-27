import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function getRecordsFromFirebase() {
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
        records.push(doc.data());
    });
    return records;
}
const currentUser = localStorage.getItem('currentUser');
const storageKey = currentUser ? `transactions_${currentUser}` : 'transactions';

// 2. 頁面載入後立即執行
window.addEventListener('load', () => {
    console.log("正在嘗試從金鑰讀取資料:", storageKey);
    initRecordDisplay();
});

function initRecordDisplay(sortOrder = 'newest') {
    const listElement = document.getElementById('list');
    if (!listElement) {
        console.error("錯誤：找不到 id 為 'list' 的元素！");
        return;
    }

    // 同時檢查個人與公共資料，合併後去重
    const userTs = JSON.parse(localStorage.getItem(storageKey)) || [];
    const publicTs = JSON.parse(localStorage.getItem('transactions')) || [];

    // 合併資料
    let transactions = [...userTs];
    if (storageKey !== 'transactions') {
        // 如果是個人帳號，把公共資料也抓進來顯示 (視需求而定)
        transactions = [...transactions, ...publicTs];
    }

    // 排序邏輯
    transactions.sort((a, b) => {
        return sortOrder === 'newest'
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
    });

    listElement.innerHTML = ''; // 清空載入中文字

    if (transactions.length === 0) {
        listElement.innerHTML = `<li style="text-align: center; color: #888; padding: 20px;">📭 目前沒有任何紀錄。</li>`;
        return;
    }

    // 渲染資料
    transactions.forEach(t => {
        const amt = parseFloat(t.amount || t.money || t.amt || 0);
        // 強力偵測名稱：掃描所有屬性
        let displayTitle = t.text || t.desc || t.name || t.title || t.item;
        if (!displayTitle) {
            const keys = Object.keys(t);
            const autoKey = keys.find(k => typeof t[k] === 'string' && !k.includes('date') && k !== 'id');
            displayTitle = autoKey ? t[autoKey] : "未命名項目";
        }

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

// 刪除功能
function removeTransaction(id) {
    if (!confirm('確定刪除這筆紀錄嗎？')) return;
    let ts = JSON.parse(localStorage.getItem(storageKey)) || [];
    ts = ts.filter(t => String(t.id) !== String(id));
    localStorage.setItem(storageKey, JSON.stringify(ts));
    initRecordDisplay(); // 刷新
}

// 按鈕接口
window.sortRecords = (order) => initRecordDisplay(order);
window.resetFilter = () => {
    const filter = document.getElementById('date-filter');
    if (filter) filter.value = '';
    initRecordDisplay();
};

/**
 * 計算總額與餘額
 */
function calculateMonthlyStats(data = null) {
    const transactions = data || JSON.parse(localStorage.getItem(storageKey)) || [];
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        const amt = parseFloat(t.amount);
        if (amt > 0) income += amt;
        else expense += Math.abs(amt);
    });

    const balance = income - expense;

    const incEl = document.getElementById('monthly-income');
    const expEl = document.getElementById('monthly-expense');
    const balEl = document.getElementById('monthly-balance');

    if (incEl) incEl.innerText = `+$${income.toLocaleString()}`;
    if (expEl) expEl.innerText = `-$${expense.toLocaleString()}`;
    if (balEl) {
        balEl.innerText = `$${balance.toLocaleString()}`;
        balEl.style.color = balance >= 0 ? '#28a745' : '#dc3545';
    }
}

// 綁定按鈕：復原、排序
function resetFilter() {
    dateFilterInput.value = '';
    initRecordDisplay();
}
function sortRecords(order) {
    initRecordDisplay(order);
}

// 綁定按鈕：顯示統計
if (toggleBtn) {
    toggleBtn.onclick = () => {
        summaryBox.classList.toggle('summary-show');
        calculateMonthlyStats();
    };
}
function remindToLine() {
    // 1. 設定你想發送到 Line 的文字
    const message = "📢 【班費繳交提醒】\n各位同學，請記得繳交本次班費！🙏";

    // 2. 組合 Line 分享網址
    const lineUrl = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(message)}`;

    // 3. 彈出確認並開啟
    if (confirm("即將開啟 Line 分享，請選擇要發送的班級群組。")) {
        window.open(lineUrl, '_blank');

        // 4. 同時在網頁上也留下一則公告（選配）
        localStorage.setItem('global_class_announcement', JSON.stringify({
            text: "📢 提醒訊息已發送到 Line 群組！",
            time: new Date().getTime()
        }));
    }
}
