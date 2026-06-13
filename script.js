// 1. 🌟 引入 Firebase 核心模組
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
            console.log("照片已就緒，自動壓縮與 Base64 轉換將在提交時執行");
        } else {
            fileNameDisplay.innerText = '未選擇任何檔案';
            fileNameDisplay.style.color = '#888';
        }
    });
}

// 🎯 監聽登入狀態
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("使用者已登入:", user.uid);
        if (document.getElementById('display-username')) {
            document.getElementById('display-username').innerText = user.email || "使用者";
        }
        // 🌟 啟動實時雲端監聽最新總餘額
        startListeningBalance(user.uid);
    } else {
        console.log("未登入，跳轉至登入頁面");
        window.location.href = 'login.html';
    }
});

// 🎯 即時監聽雲端資料，並動態更新「畫面上的總金額」
function startListeningBalance(uid) {
    const q = query(collection(db, "transactions"), where("uid", "==", uid));

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

// 🎯 核心功能：自動壓縮圖片小幫手 (限寬 800px，品質 70%，體積大減 90%)
const compressAndToBase64 = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 📐 進行等比例縮放
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // 💾 輸出壓縮後的 Base64 字串
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};

// 🎯 表單送出時，壓縮圖片並寫入 Firebase 雲端
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!auth.currentUser) {
            alert("登入逾期，請重新登入！");
            window.location.href = 'login.html';
            return;
        }

        const rawAmount = parseFloat(amountInput.value);
        const amount = typeSelect.value === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

        // 🛠️ 關鍵修正：這裡已將原本的舊 toBase64 替換成全新的「智慧壓縮版」
        let receiptBase64 = null;
        if (receiptInput.files[0]) {
            try {
                if (fileNameDisplay) fileNameDisplay.innerText = "照片壓縮中，請稍候...";
                receiptBase64 = await compressAndToBase64(receiptInput.files[0]);
            } catch (err) {
                console.error("照片壓縮失敗:", err);
                alert("照片處理失敗，請重新選擇照片！");
                return;
            }
        }

        // 🌟 建立雲端物件
        const newTransaction = {
            uid: auth.currentUser.uid,
            text: descriptionInput.value,
            description: descriptionInput.value,
            amount: amount,
            date: dateInput.value,
            receipt: receiptBase64, // 存入瘦身成功的安全 Base64 數據
            createdAt: new Date()
        };

        try {
            // 🔥 推送進 Firebase
            await addDoc(collection(db, "transactions"), newTransaction);

            // 成功後的畫面清理
            form.reset();
            if (fileNameDisplay) {
                fileNameDisplay.textContent = '未選擇任何檔案';
                fileNameDisplay.style.color = '#888';
            }
            alert('新增成功，已即時同步至雲端！');
        } catch (error) {
            console.error("雲端儲存失敗:", error);
            alert("儲存失敗，請檢查網路連線：" + error.message);
        }
    });
}

// 🎯 雲端登出功能
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        if (confirm("確定要登出嗎？")) {
            try {
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (error) {
                alert("登出失敗：" + error.message);
            }
        }
    });
}

// 忘記密碼提示
const forgotPwBtn = document.getElementById('forgot-pw-btn');
if (forgotPwBtn) {
    forgotPwBtn.addEventListener('click', () => {
        alert('請聯繫班級管理員或資訊股長重設密碼。');
    });
}