document.addEventListener("DOMContentLoaded", function () {
    updateUserUI();
});

// ✅ Cập nhật giao diện dựa trên trạng thái đăng nhập
function updateUserUI() {
    const user = JSON.parse(localStorage.getItem("user"));
    const subnavIcons = document.querySelector(".subnav-icons");

    if (user) {
        // Nếu đã đăng nhập → Hiển thị user menu
        subnavIcons.innerHTML = `
            <i class="ti-bell"></i>
            <i class="ti-shopping-cart"></i>
            <div class="user-menu">
                <i class="ti-user" id="user-icon"></i>
                <div class="user-dropdown" id="user-dropdown">
                    <a href="../pages/user.html"><i class="ti-user"></i> Profile</a>
                    <a href="buying.html"><i class="ti-shopping-cart"></i> Buying</a>
                    <a href="selling.html"><i class="ti-money"></i> Selling</a>
                    <a href="favorites.html"><i class="ti-heart"></i> Favorites</a>
                    <a href="wallet.html"><i class="ti-wallet"></i> Wallet</a>
                    <a href="settings.html"><i class="ti-settings"></i> Settings</a>
                    <button id="logout-btn"><i class="ti-power-off"></i> Log Out</button>
                </div>
            </div>
        `;
        addDropdownEvent(); // Kích hoạt dropdown user
        addLogoutEvent(); // Kích hoạt logout
    } else {
        // Nếu chưa đăng nhập → Hiển thị nút Sign Up & Login
        subnavIcons.innerHTML = `
            <i class="ti-bell"></i>
            <i class="ti-shopping-cart"></i>
            <button class="btn" id="login-btn">Login</button>
            <button class="btn" id="signup-btn">Sign Up</button>
        `;

        setTimeout(() => {
            document.getElementById("login-btn").addEventListener("click", () => {
                window.location.href = "login.html";
            });
            document.getElementById("signup-btn").addEventListener("click", () => {
                window.location.href = "signup.html";
            });
        }, 100);
    }
}

// ✅ Kích hoạt sự kiện dropdown user
function addDropdownEvent() {
    const userIcon = document.getElementById("user-icon");
    const userDropdown = document.getElementById("user-dropdown");

    if (userIcon && userDropdown) {
        userIcon.addEventListener("click", function (event) {
            event.stopPropagation(); // Ngăn chặn sự kiện lan ra ngoài
            userDropdown.classList.toggle("show"); // Hiển thị / Ẩn menu dropdown
        });

        // Ẩn dropdown nếu click bên ngoài
        document.addEventListener("click", function (event) {
            if (!userIcon.contains(event.target) && !userDropdown.contains(event.target)) {
                userDropdown.classList.remove("show");
            }
        });
    }
}

// ✅ Hàm đăng xuất
function addLogoutEvent() {
    document.getElementById("logout-btn").addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload(); // Load lại trang để reset giao diện
    });
}
