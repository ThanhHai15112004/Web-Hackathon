document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Lấy dữ liệu từ form
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const termsChecked = document.getElementById("terms").checked;

    // Kiểm tra dữ liệu hợp lệ
    if (!validateEmail(email)) {
        showError("Email không hợp lệ!");
        return;
    }

    if (!validatePassword(password)) {
        showError("Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt!");
        return;
    }

    if (!termsChecked) {
        showError("Bạn cần đồng ý với điều khoản!");
        return;
    }

    showLoading(); // Hiển thị loading khi đăng ký

    const requestData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        phone: "0000000000"
    };

    try {
        const response = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = "login.html"; // Chuyển hướng đến trang đăng nhập
        } else {
            showError(result.error || "Email đã tồn tại!");
            hideLoading();
        }
    } catch (error) {
        showError("Lỗi kết nối máy chủ!");
        hideLoading();
    }
});

// ✅ Kiểm tra email hợp lệ
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ✅ Kiểm tra mật khẩu mạnh
function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// ✅ Hiển thị hiệu ứng loading
function showLoading() {
    document.body.innerHTML += `<div class="loading-screen">Loading...</div>`;
}

// ✅ Ẩn loading
function hideLoading() {
    const loadingScreen = document.querySelector(".loading-screen");
    if (loadingScreen) loadingScreen.remove();
}

// ✅ Hiển thị lỗi
function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerText = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}
