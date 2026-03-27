// --- 1. 引入 Firebase (這幾行一定要在最上面) ---
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 2. 找到你原本處理「提交表單」的事件 ---
async function handleFormSubmit(event) {
    event.preventDefault(); // 防止網頁重整

    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;

    try {
        // 🚀 關鍵：將資料推送到 Firebase
        const docRef = await addDoc(collection(db, "transactions"), {
            date: date,
            description: description,
            amount: Number(amount),
            timestamp: new Date()
        });

        console.log("雲端儲存成功，ID 為: ", docRef.id);
        alert("資料已同步到雲端！🐾");
        
        // 儲存後跳轉回明細頁
        window.location.href = 'record.html'; 
        
    } catch (e) {
        console.error("儲存失敗: ", e);
        alert("儲存失敗，請檢查網路或 Firebase 規則");
    }
}

// 綁定按鈕
document.getElementById('transactionForm').addEventListener('submit', handleFormSubmit);
const balanceDisplay = document.getElementById('balance');
const form = document.getElementById('add-transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const typeSelect = document.getElementById('type');
const receiptInput = document.getElementById('receipt');
const fileNameDisplay = document.getElementById('file-name-display');

// 1. 取得登入狀態與專屬儲存 Key
const currentUser = localStorage.getItem('currentUser');
const storageKey = `transactions_${currentUser}`;
let transactions = [];

function init() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('display-username').innerText = currentUser;

    const stored = JSON.parse(localStorage.getItem(storageKey));
    transactions = stored || [];
    updateValues();
}

function updateValues() {
    const total = transactions.reduce((acc, t) => acc + t.amount, 0);
    if (balanceDisplay) {
        balanceDisplay.innerText = `$${total.toFixed(2)}`;
        balanceDisplay.style.color = (total >= 0) ? '#28a745' : '#dc3545';
    }
    localStorage.setItem(storageKey, JSON.stringify(transactions));
}

// 新增紀錄邏輯
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rawAmount = parseFloat(amountInput.value);
        // 自動轉換正負號
        const amount = typeSelect.value === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

        let receiptBase64 = null;
        if (receiptInput.files[0]) {
            receiptBase64 = await toBase64(receiptInput.files[0]);
        }

        const newTransaction = {
            id: Math.floor(Math.random() * 10000000),
            description: descriptionInput.value,
            amount,
            date: dateInput.value,
            receipt: receiptBase64
        };

        transactions.push(newTransaction);
        updateValues();
        form.reset();
        if (fileNameDisplay) fileNameDisplay.textContent = '未選擇任何檔案';
        alert('新增成功！');
    });
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// 登出功能
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

// 修改密碼面板控制
const changePwBtn = document.getElementById('change-pw-btn');
const pwSection = document.getElementById('password-form-section');
if (changePwBtn) {
    changePwBtn.addEventListener('click', () => pwSection.style.display = 'block');
    document.getElementById('cancel-change-pw').addEventListener('click', () => pwSection.style.display = 'none');
}
// login.js

const forgotPwBtn = document.getElementById('forgot-pw-btn');

if (forgotPwBtn) {
    forgotPwBtn.addEventListener('click', () => {
        // 方案 A：彈出提示訊息
        alert('請聯繫班級管理員或資訊股長重設密碼。');

        // 方案 B：如果您有專門的找回密碼頁面（例如之前找不到的那個）
        // window.location.href = 'change_password.html'; 
    });
}
init();
