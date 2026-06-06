document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[username] && users[username] === password) {
        localStorage.setItem('currentUser', username);
        message.style.color = '#28a745';
        message.innerText = '登入成功，正在導向主頁...';

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        message.style.color = '#dc3545';
        message.innerText = '帳號或密碼錯誤，請再試一次。';
    }
});
document.getElementById('forgot-pw-btn').addEventListener('click', () => {
    alert('喵！忘記密碼請聯繫班級管理員或資訊股長進行重設。');
});
// 處理 Google 登入回傳的資料
function handleCredentialResponse(response) {
    // 解碼 JWT 代碼以取得使用者資訊
    const responsePayload = parseJwt(response.credential);

    console.log("登入成功！");
    console.log("Email: " + responsePayload.email); // 🚀 這就是使用者的 Gmail
    console.log("姓名: " + responsePayload.name);

    // 1. 將 Gmail 存入 localStorage 以便跨頁面使用
    localStorage.setItem('currentUser', responsePayload.email);
    localStorage.setItem('userName', responsePayload.name);

    // 2. 顯示成功訊息並跳轉頁面
    const message = document.getElementById('message');
    message.style.color = "#28a745";
    message.textContent = "Gmail 登入成功，正在導向首頁...";

    setTimeout(() => {
        window.location.href = 'index.html'; // 跳轉至記帳首頁
    }, 1500);
}

// 輔助函數：解碼 Google 傳回的憑證
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}