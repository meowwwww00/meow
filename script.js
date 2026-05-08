const balanceDisplay = document.getElementById('balance');
const form = document.getElementById('add-transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const typeSelect = document.getElementById('type');
const receiptInput = document.getElementById('receipt');
const fileNameDisplay = document.getElementById('file-name-display');

const currentUser = localStorage.getItem('currentUser');
const storageKey = `transactions_${currentUser}`;
let transactions = [];

// --- 🚀 新增：偵測照片選取並顯示檔名 ---
if (receiptInput) {
    receiptInput.addEventListener('change', () => {
        if (receiptInput.files.length > 0) {
            // 當使用者選好照片時，立刻把「未選擇任何檔案」改掉
            fileNameDisplay.innerText = `已選取：${receiptInput.files[0].name}`;
            fileNameDisplay.style.color = "#25cc6b"; // 變成綠色提醒使用者成功了

            // (加選功能) 如果你想在網頁上直接看到縮圖，可以加上這行：
            console.log("照片已就緒，Base64 轉換將在提交時執行");
        } else {
            fileNameDisplay.innerText = '未選擇任何檔案';
            fileNameDisplay.style.color = '#888';
        }
    });
}

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

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rawAmount = parseFloat(amountInput.value);
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
    document.getElementById('cancel-change-pw').addEventListener('click', () => pwSection.style.display = 'none');
}
// login.js

const forgotPwBtn = document.getElementById('forgot-pw-btn');

if (forgotPwBtn) {
    forgotPwBtn.addEventListener('click', () => {
        alert('請聯繫班級管理員或資訊股長重設密碼。');

    });
}
init();
