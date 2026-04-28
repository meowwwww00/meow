document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const message = document.getElementById('reg-message');

    // 檢查密碼長度
    if (password.length < 6) {
        message.style.color = '#dc3545';
        message.innerText = '密碼至少需要 6 位數！';
        return;
    }

    // 檢查兩次密碼是否一致
    if (password !== confirmPassword) {
        message.style.color = '#dc3545';
        message.innerText = '密碼與確認密碼不符！';
        return;
    }

    // 取得現有帳號資料
    let users = JSON.parse(localStorage.getItem('users')) || {};

    // 檢查帳號是否重複
    if (users[username]) {
        message.style.color = '#dc3545';
        message.innerText = '此帳號已存在，請換一個。';
        return;
    }

    // 儲存並提示成功
    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));

    message.style.color = '#28a745';
    message.innerText = '註冊成功！即將跳轉至登入頁面...';

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
});