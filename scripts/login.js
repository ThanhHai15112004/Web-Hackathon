document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Ngăn form reload

    const email = document.getElementById("first-name").value.trim();
    const password = document.getElementById("password").value.trim();

    // Kiểm tra Email hợp lệ
    if (!validateEmail(email)) {
        showError("Email không hợp lệ!");
        return;
    }

    // Kiểm tra mật khẩu có nhập không
    if (password.length < 6) {
        showError("Mật khẩu không được để trống!");
        return;
    }

    const requestData = { email, password };

    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (response.ok) {
            showLoading(); // Chỉ hiển thị loading nếu đăng nhập thành công
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            setTimeout(() => {
                window.location.href = "index.html"; // Chuyển hướng sau khi loading
            }, 1000);
        } else {
            showError("Sai email hoặc mật khẩu!");
        }
    } catch (error) {
        showError("Lỗi kết nối máy chủ!");
    }
});

// Kiểm tra email hợp lệ
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Hiển thị hiệu ứng loading
function showLoading() {
    document.body.innerHTML += `<div class="loading-screen">Loading...</div>`;
}

// Hiển thị lỗi
function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerText = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}
