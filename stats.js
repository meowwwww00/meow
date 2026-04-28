const currentUser = localStorage.getItem('currentUser');
const storageKey = currentUser ? `transactions_${currentUser}` : 'transactions';

window.onload = function () {
    const ySel = document.getElementById('yearSelect');
    const mSel = document.getElementById('monthSelect');
    if (ySel) ySel.addEventListener('change', checkAndRender);
    if (mSel) mSel.addEventListener('change', checkAndRender);

    // 初始提示：確保這裡沒有寫死 2025
    clearTable("請選擇年份與月份以查看統計資料");
};

function checkAndRender() {
    const selYear = document.getElementById('yearSelect').value;
    const selMonth = document.getElementById('monthSelect').value;
    // 如果選單裡有「年」或「月」字眼，過濾掉只留數字
    const cleanYear = selYear.replace(/[^0-9]/g, "");
    const cleanMonth = selMonth.replace(/[^0-9]/g, "").padStart(2, '0');

    if (!cleanYear || !cleanMonth || cleanMonth === "00") {
        clearTable("請選擇年份與月份以查看統計資料");
        return;
    }
    renderStats(cleanYear, cleanMonth);
}

function renderStats(year, month) {
    const userTs = JSON.parse(localStorage.getItem(storageKey)) || [];
    const publicTs = JSON.parse(localStorage.getItem('transactions')) || [];
    let allTs = [...userTs, ...publicTs];

    let income = 0, expense = 0, hasData = false;
    const statsBody = document.getElementById('statsBody');
    statsBody.innerHTML = '';

    allTs.forEach(t => {
        if (!t.date) return;
        // 自動相容 - 或 / 的日期格式
        const dateParts = t.date.split(/[-/]/);
        const tYear = dateParts[0];
        const tMonth = dateParts[1].padStart(2, '0');

        if (tYear === year && tMonth === month) {
            // 自動偵測所有可能的金額欄位名稱
            const amt = parseFloat(t.amount || t.money || t.amt || t.price || 0);
            if (amt > 0) income += amt;
            else expense += Math.abs(amt);
            hasData = true;
        }
    });

    if (!hasData) {
        // 這裡絕不寫死年份，直接用變數顯示
        clearTable(`${year}年 ${month}月 沒有找到任何紀錄`);
        return;
    }

    const balance = income - expense;
    statsBody.innerHTML = `
        <tr>
            <td>${parseInt(month)} 月</td>
            <td style="color: #28a745; font-weight: bold;">+$${income.toLocaleString()}</td>
            <td style="color: #dc3545; font-weight: bold;">-$${expense.toLocaleString()}</td>
            <td style="color: ${balance >= 0 ? '#28a745' : '#dc3545'}; font-weight: bold;">$${balance.toLocaleString()}</td>
        </tr>
    `;
}

function clearTable(msg) {
    const statsBody = document.getElementById('statsBody');
    if (statsBody) statsBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:30px;">${msg}</td></tr>`;
}