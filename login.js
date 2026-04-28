document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    // 取得所有註冊過的使用者
    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[username] && users[username] === password) {
        // 登入成功：儲存當前使用者並跳轉
        localStorage.setItem('currentUser', username);
        message.style.color = '#28a745';
        message.innerText = '登入成功，正在導向主頁...';

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        // 登入失敗
        message.style.color = '#dc3545';
        message.innerText = '帳號或密碼錯誤，請再試一次。';
    }
});

// 忘記密碼按鈕
document.getElementById('forgot-pw-btn').addEventListener('click', () => {
    alert('喵！忘記密碼請聯繫班級管理員或資訊股長進行重設。');
});