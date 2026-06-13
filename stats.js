// 1. 🌟 引入 Firebase 核心模組 (請確保路徑與你的 firebaseInit.js 一致)
import { db, auth } from './firebaseInit.js';
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 全域變數：用來存放從 Firebase 即時同步下來的帳目陣列
let firebaseTransactions = [];

document.addEventListener('DOMContentLoaded', () => {
    const ySel = document.getElementById('year-select');
    const mSel = document.getElementById('month-select');
    const currentYear = new Date().getFullYear();

    // --- 2. 動態生成年份選單 (修正原先到1年的邏輯，改為顯示最近 5 年，避免選單過長當機) ---
    if (ySel) {
        ySel.innerHTML = '';
        for (let i = currentYear; i >= currentYear - 4; i--) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `${i}年`;
            ySel.appendChild(option);
        }
        ySel.value = currentYear.toString(); // 預設選中今年 (2026)
    }

    // --- 3. 設定月份預設值 ---
    if (mSel) mSel.value = "all";

    // --- 4. 綁定選單切換事件 (切換時直接重新計算 UI) ---
    if (ySel) ySel.addEventListener('change', updateStats);
    if (mSel) mSel.addEventListener('change', updateStats);

    // 重置按鈕
    const resetBtn = document.getElementById('statResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            ySel.value = currentYear.toString();
            mSel.value = "all";
            updateStats();
        });
    }
});

// 🎯 核心改動：偵測登入狀態，成功後開啟雲端即時監聽
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("統計頁面已成功連線至雲端，使用者：", user.uid);
        startListeningTransactions(user.uid);
    } else {
        console.log("未登入，跳轉至登入頁面");
        window.location.href = 'login.html';
    }
});

// 🎯 核心改動：實時監聽該使用者的所有雲端帳目
function startListeningTransactions(uid) {
    const q = query(collection(db, "transactions"), where("uid", "==", uid));

    onSnapshot(q, (snapshot) => {
        firebaseTransactions = []; // 清空舊資料
        snapshot.forEach((doc) => {
            firebaseTransactions.push(doc.data());
        });

        console.log(`已成功從雲端同步 ${firebaseTransactions.length} 筆明細，開始計算報表...`);
        // 每次雲端資料有變動，自動觸發重新計算
        updateStats();
    }, (error) => {
        console.error("雲端報表即時同步失敗:", error);
    });
}

// 🎯 計算與渲染 UI (邏輯維持你原有的精緻設計，但資料源換成雲端)
function updateStats() {
    const ySel = document.getElementById('year-select');
    const mSel = document.getElementById('month-select');
    if (!ySel || !mSel) return;

    const year = ySel.value;
    const month = mSel.value;

    let income = 0, expense = 0, hasData = false;
    const statsBody = document.getElementById('statsBody');
    if (!statsBody) return;
    statsBody.innerHTML = '';

    // 使用從 Firebase 抓下來的即時資料進行篩選
    firebaseTransactions.forEach(t => {
        if (!t.date) return;

        // 拆解日期字串 (支援 2026-06-13 或 2026/06/13)
        const dateParts = t.date.split(/[-/]/);
        const tYear = dateParts[0];
        const tMonth = dateParts[1].padStart(2, '0');

        const yearMatch = tYear === year;
        const monthMatch = (month === "all") ? true : tMonth === month;

        if (yearMatch && monthMatch) {
            // 對齊你主頁面存入的欄位名稱 amount
            const amt = parseFloat(t.amount || 0);
            if (amt > 0) {
                income += amt;
            } else {
                expense += Math.abs(amt); // 支出轉為正數累加
            }
            hasData = true;
        }
    });

    // 渲染「無資料」畫面
    if (!hasData) {
        const displayMonth = (month === "all") ? "整年度" : `${parseInt(month)}月`;
        statsBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:30px;">${year}年 ${displayMonth} 沒有找到任何紀錄</td></tr>`;
        return;
    }

    // 渲染「有資料」的統計結果 row
    const balance = income - expense;
    const monthText = (month === "all") ? "整年度" : `${parseInt(month)} 月`;

    statsBody.innerHTML = `
        <tr>
            <td>${monthText}</td>
            <td class="income-text">+$${income.toLocaleString()}</td>
            <td class="expense-text">-$${expense.toLocaleString()}</td>
            <td style="color: ${balance >= 0 ? '#28a745' : '#dc3545'}; font-weight: bold;">$${balance.toLocaleString()}</td>
        </tr>
    `;
}