// 1. 定義資料 Key (確保與你的紀錄頁面一致)
const currentUser = localStorage.getItem('currentUser');
const storageKey = currentUser ? `transactions_${currentUser}` : 'transactions';

document.addEventListener('DOMContentLoaded', () => {
    const ySel = document.getElementById('year-select');
    const mSel = document.getElementById('month-select');
    const currentYear = new Date().getFullYear();

    // --- 2. 動態生成年份選單 (從今年倒退到 1 年) ---
    if (ySel) {
        ySel.innerHTML = ''; // 清除 HTML 裡寫死的 2025/2026
        for (let i = currentYear; i >= 1; i--) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `${i}年`;
            ySel.appendChild(option);
        }
        ySel.value = currentYear.toString(); // 預設選中今年
    }

    // --- 3. 設定月份預設值 ---
    if (mSel) mSel.value = "all";

    // --- 4. 綁定監聽事件 ---
    if (ySel) ySel.addEventListener('change', updateStats);
    if (mSel) mSel.addEventListener('change', updateStats);

    const resetBtn = document.getElementById('statResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            ySel.value = currentYear.toString();
            mSel.value = "all";
            updateStats();
        });
    }

    // --- 5. 🚀 關鍵動作：立即執行統計 (一進去就有資料) ---
    updateStats();
});

function updateStats() {
    const ySel = document.getElementById('year-select');
    const mSel = document.getElementById('month-select');
    if (!ySel || !mSel) return;

    const year = ySel.value;
    const month = mSel.value;

    // 抓取 LocalStorage 資料
    const userTs = JSON.parse(localStorage.getItem(storageKey)) || [];
    const publicTs = JSON.parse(localStorage.getItem('transactions')) || [];
    let allTs = [...userTs, ...publicTs];

    let income = 0, expense = 0, hasData = false;
    const statsBody = document.getElementById('statsBody');
    if (!statsBody) return;
    statsBody.innerHTML = '';

    // 執行篩選與計算
    allTs.forEach(t => {
        if (!t.date) return;

        const dateParts = t.date.split(/[-/]/);
        const tYear = dateParts[0];
        const tMonth = dateParts[1].padStart(2, '0');

        const yearMatch = tYear === year;
        const monthMatch = (month === "all") ? true : tMonth === month;

        if (yearMatch && monthMatch) {
            const amt = parseFloat(t.amount || t.money || t.amt || t.price || 0);
            if (amt > 0) income += amt;
            else expense += Math.abs(amt);
            hasData = true;
        }
    });

    // 渲染畫面
    if (!hasData) {
        const displayMonth = (month === "all") ? "整年度" : `${parseInt(month)}月`;
        statsBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:30px;">${year}年 ${displayMonth} 沒有找到任何紀錄</td></tr>`;
        return;
    }

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