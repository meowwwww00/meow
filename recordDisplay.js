const currentUser = localStorage.getItem('currentUser');
const storageKey = currentUser ? `transactions_${currentUser}` : 'transactions';

let currentSortOrder = 'newest';

window.addEventListener('load', () => {
 console.log("正在嘗試從金鑰讀取資料:", storageKey);
 initRecordDisplay();

const confirmBtn = document.getElementById('confirmBtn');
 if (confirmBtn) {
 confirmBtn.addEventListener('click', () => {
 initRecordDisplay(currentSortOrder);
 });
 }

const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
 resetBtn.addEventListener('click', () => {
 document.getElementById('start-date').value = '';
 document.getElementById('end-date').value = '';
 initRecordDisplay(currentSortOrder);
});
 }
});

function initRecordDisplay(sortOrder = currentSortOrder) {
currentSortOrder = sortOrder;
 const listElement = document.getElementById('list');
 if (!listElement) return;

const userTs = JSON.parse(localStorage.getItem(storageKey)) || [];
const publicTs = JSON.parse(localStorage.getItem('transactions')) || [];

let transactions = [...userTs];
 if (storageKey !== 'transactions') {
 transactions = [...transactions, ...publicTs];
 }

 // 🚀 核心改動：區間篩選邏輯
const startDate = document.getElementById('start-date') ? document.getElementById('start-date').value : '';
const endDate = document.getElementById('end-date') ? document.getElementById('end-date').value : '';

 if (startDate || endDate) {
 transactions = transactions.filter(t => {            const itemDate = t.date;
 const isAfterStart = startDate ? itemDate >= startDate : true;
 const isBeforeEnd = endDate ? itemDate <= endDate : true;            return isAfterStart && isBeforeEnd;
});
}

transactions.sort((a, b) => {
 return sortOrder === 'newest'
? new Date(b.date) - new Date(a.date)
: new Date(a.date) - new Date(b.date);
});

listElement.innerHTML = '';

 if (transactions.length === 0) {
listElement.innerHTML = `<li style="text-align: center; color: #888; padding: 20px;">📭 目前沒有任何紀錄。</li>`;
return;
 }

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
<div style="display: flex; flex-direction: column;">
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

// 🚀 新增：跳轉至編輯頁面函數
window.editTransaction = function (id) {
// 將該筆紀錄的 ID 透過網址參數傳給 edit.html
window.location.href = `edit.html?id=${id}`;
};

window.viewFullImage = function (base64Data) {
const newTab = window.open();
newTab.document.body.innerHTML = `
<body style="margin:0; display:ex; align-items:center; justify-content:center; background:#000;">
 <img src="${base64Data}" style="max-width:100%; max-height:100vh; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
</body>`;
};

window.removeTransaction = function (id) {
if (!confirm('確定刪除這筆紀錄嗎？')) return;
let ts = JSON.parse(localStorage.getItem(storageKey)) || [];
ts = ts.filter(t => String(t.id) !== String(id));
localStorage.setItem(storageKey, JSON.stringify(ts));
initRecordDisplay();
};

window.sortRecords = function (order) {
initRecordDisplay(order);
};

window.remindToLine = function () {
const message = "📢 【班費繳交提醒】\n各位同學，請記得繳交本次班費！🙏";
const lineUrl = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(message)}`;
if (confirm("即將開啟 Line 分享，請選擇要發送的班級群組。")) {
window.open(lineUrl, '_blank');
 }
};