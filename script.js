// 1. 🌟 引入 Firebase 核心模組 (請確保路徑與你的 firebaseInit.js 一致)
import { db, auth } from './firebaseInit.js';
import { collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const balanceDisplay = document.getElementById('balance');
const form = document.getElementById('add-transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const typeSelect = document.getElementById('type');
const receiptInput = document.getElementById('receipt');
const fileNameDisplay = document.getElementById('file-name-display');

// --- 🚀 偵測照片選取並顯示檔名 ---
if (receiptInput) {
    receiptInput.addEventListener('change', () => {
        if (receiptInput.files.length > 0) {
            fileNameDisplay.innerText = `已選取：${receiptInput.files[0].name}`;
            fileNameDisplay.style.color = "#25cc6b";
            console.log("照片已就緒，Base64 轉換將在提交時執行");
        } else {
            fileNameDisplay.innerText = '未選擇任何檔案';
            fileNameDisplay.style.color = '#888';
        }
    });
}

// 🎯 核心改動：取代舊的 init()，改由 Firebase 監聽登入狀態
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("使用者已登入:", user.uid);
        // 顯示登入的使用者名稱（優先顯示 Email，或顯示自訂名稱）
        if (document.getElementById('display-username')) {
            document.getElementById('display-username').innerText = user.email || "使用者";
        }

        // 🌟 啟動實時雲端監聽，去計算目前帳號的最新總餘額
        startListeningBalance(user.uid);
    } else {
        console.log("未登入，跳轉至登入頁面");
        window.location.href = 'login.html';
    }
});

// 🎯 新增：即時監聽雲端資料，並動態更新「畫面上的總金額」
function startListeningBalance(uid) {
    const q = query(collection(db, "transactions"), where("uid", "==", uid));

    // 只要雲端有任何一筆帳目被新增或刪除，這裡就會秒速重新計算
    onSnapshot(q, (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
            const t = doc.data();
            total += parseFloat(t.amount || 0);
        });

        // 更新畫面的總餘額
        if (balanceDisplay) {
            balanceDisplay.innerText = `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            balanceDisplay.style.color = (total >= 0) ? '#28a745' : '#dc3545';
        }
    }, (error) => {
        console.error("餘額同步失敗:", error);
    });
}

// 🎯 核心改動：表單送出時，直接將資料寫入 Firebase 雲端
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 安全防護：沒登入不給傳
        if (!auth.currentUser) {
            alert("登入逾期，請重新登入！");
            window.location.href = 'login.html';
            return;
        }

        const rawAmount = parseFloat(amountInput.value);
        const amount = typeSelect.value === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

        // 處理圖片轉 Base64
        let receiptBase64 = null;
        if (receiptInput.files[0]) {
            receiptBase64 = await toBase64(receiptInput.files[0]);
        }

        // 🌟 建立要上傳的雲端物件，牢牢綁定當前使用者的 uid
        const newTransaction = {
            uid: auth.currentUser.uid, // ⭐ 跨裝置同步的最核心關鍵！
            text: descriptionInput.value, // 與明細頁對齊
            description: descriptionInput.value,
            amount: amount,
            date: dateInput.value,
            receipt: receiptBase64,
            createdAt: new Date() // 存入建立時間
        };

        try {
            // 🔥 直接推送進 Firebase 的 "transactions" 集合中
            await addDoc(collection(db, "transactions"), newTransaction);

            // 成功後的畫面清理
            form.reset();
            if (fileNameDisplay) fileNameDisplay.textContent = '未選擇任何檔案';
            alert('新增成功，已即時同步至雲端！');
        } catch (error) {
            console.error("雲端儲存失敗:", error);
            alert("儲存失敗，請檢查網路連線：" + error.message);
        }
    });
}

// 圖片轉換小幫手（保持原樣）
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// 🎯 核心改動：登出功能改用 Firebase 雲端登出
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        if (confirm("確定要登出嗎？")) {
            try {
                await signOut(auth); // 呼叫 Firebase 登出
                window.location.href = 'login.html';
            } catch (error) {
                alert("登出失敗：" + error.message);
            }
        }
    });
}

// 忘記密碼提示（保持原樣）
const forgotPwBtn = document.getElementById('forgot-pw-btn');
if (forgotPwBtn) {
    forgotPwBtn.addEventListener('click', () => {
        alert('請聯繫班級管理員或資訊股長重設密碼。');
    });
}