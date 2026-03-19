document.getElementById('reset-pw-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('reset-username').value.trim();
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    const message = document.getElementById('reset-message');

    // 1. 取得所有使用者資料
    let users = JSON.parse(localStorage.getItem('users')) || {};

    // 2. 驗證邏輯
    if (!users[username]) {
        message.style.color = '#dc3545';
        message.innerText = '找不到此帳號，請確認輸入是否正確。';
        return;
    }

    if (newPassword.length < 6) {
        message.style.color = '#dc3545';
        message.innerText = '新密碼長度需至少 6 位！';
        return;
    }

    if (newPassword !== confirmNewPassword) {
        message.style.color = '#dc3545';
        message.innerText = '兩次輸入的新密碼不一致！';
        return;
    }

    // 3. 更新密碼
    users[username] = newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    message.style.color = '#28a745';
    message.innerText = '密碼重設成功！即將跳轉至登入頁面...';

    // 4. 跳轉
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
});