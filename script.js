// --- 1. [新增] 引入 Firebase 模組 ---
import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const balanceDisplay = document.getElementById('balance');
const form = document.getElementById('add-transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const typeSelect = document.getElementById('type');
const receiptInput = document.getElementById('receipt');
const fileNameDisplay = document.getElementById('file-name-display');

const currentUser = localStorage.getItem('currentUser');
let transactions = [];

function init() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    const userDisplay = document.getElementById('display-username');
    if (userDisplay) userDisplay.innerText = currentUser;

    // 注意：讀取資料現在由 recordDisplay.js 負責雲端讀取
    // 這裡 init 主要負責確認登入狀態
}

// --- 2. [修改] 新增紀錄邏輯：改為寫入 Firebase ---
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rawAmount = parseFloat(amountInput.value);
        const amount = typeSelect.value === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

        let receiptBase64 = null;
        if (receiptInput.files[0]) {
            receiptBase64 = await toBase64(receiptInput.files[0]);
        }

        try {
            // 🚀 關鍵動作：將資料推送到 Firebase Firestore
            const docRef = await addDoc(collection(db, "transactions"), {
                description: descriptionInput.value,
                amount: amount,
                date: dateInput.value,
                receipt: receiptBase64,
                user: currentUser, // 紀錄是誰存的
                timestamp: new Date()
            });

            console.log("雲端儲存成功，文件 ID:", docRef.id);
            alert('新增成功，資料已同步到雲端！🐾');
            
            form.reset();
            if (fileNameDisplay) fileNameDisplay.textContent = '未選擇任何檔案';
            
            // 跳轉回明細頁面查看結果
            window.location.href = 'record.html'; 

        } catch (error) {
            console.error("儲存失敗：", error);
            alert('儲存失敗，請檢查網路或 Firebase 權限。');
        }
    });
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// --- 3. 登出與 UI 控制 (維持原樣) ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

const changePwBtn = document.getElementById('change-pw-btn');
const pwSection = document.getElementById('password-form-section');
if (changePwBtn) {
    changePwBtn.addEventListener('click', () => pwSection.style.display = 'block');
    const cancelBtn = document.getElementById('cancel-change-pw');
    if (cancelBtn) cancelBtn.addEventListener('click', () => pwSection.style.display = 'none');
}

const forgotPwBtn = document.getElementById('forgot-pw-btn');
if (forgotPwBtn) {
    forgotPwBtn.addEventListener('click', () => {
        alert('請聯繫班級管理員或資訊股長重設密碼。');
    });
}

init();
