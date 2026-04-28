document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const message = document.getElementById('reg-message');

    if (password.length < 6) {
        message.style.color = '#dc3545';
        message.innerText = '密碼至少需要 6 位數！';
        return;
    }

    if (password !== confirmPassword) {
        message.style.color = '#dc3545';
        message.innerText = '密碼與確認密碼不符！';
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[username]) {
        message.style.color = '#dc3545';
        message.innerText = '此帳號已存在，請換一個。';
        return;
    }

    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));

    message.style.color = '#28a745';
    message.innerText = '註冊成功！即將跳轉至登入頁面...';

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
});