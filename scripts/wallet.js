document.addEventListener("DOMContentLoaded", async () => {
    const addWalletButton = document.querySelector(".add-button");
    const walletInfoContainer = document.querySelector(".wallet-info");
    const noPaymentInfo = document.querySelector(".no-payment-info");
    
    // 🟢 Thêm nút hủy kết nối ví
    const disconnectButton = document.createElement("button");
    disconnectButton.classList.add("disconnect-button");
    disconnectButton.innerText = "Disconnect Wallet";
    disconnectButton.style.display = "none"; // Mặc định ẩn

    // 🟢 Kiểm tra user đăng nhập
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Vui lòng đăng nhập trước khi liên kết ví!");
        window.location.href = "login.html";
        return;
    }

    // 🟢 Kiểm tra Metamask
    if (typeof window.ethereum !== "undefined") {
        console.log("✅ Metamask đã được cài đặt");
    } else {
        alert("❌ Metamask chưa được cài đặt. Vui lòng cài đặt để tiếp tục!");
        return;
    }

    // 🟢 Kiểm tra trạng thái ví khi tải trang
    async function checkWalletStatus() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/wallet/${user.id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok && data.wallet_address) {
                displayWalletInfo(data.wallet_address, data.wallet_balance);
                addWalletButton.innerText = "Wallet Connected";
                addWalletButton.disabled = true;
                disconnectButton.style.display = "block"; // Hiển thị nút Disconnect
                noPaymentInfo.style.display = "none";
            } else {
                addWalletButton.innerText = "Add Wallet";
                addWalletButton.disabled = false;
                disconnectButton.style.display = "none"; // Ẩn nếu chưa có ví
            }
        } catch (error) {
            console.error("Lỗi kiểm tra ví:", error);
        }
    }

    // 🟢 Kết nối ví Metamask
    async function connectWallet() {
        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            const walletAddress = accounts[0];

            console.log("🔗 Kết nối thành công, địa chỉ ví:", walletAddress);

            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/wallet/connect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ user_id: user.id, wallet_address: walletAddress })
            });

            const result = await response.json();

            if (response.ok) {
                alert("🔗 Kết nối ví thành công!");
                displayWalletInfo(walletAddress, 0);
                addWalletButton.innerText = "Wallet Connected";
                addWalletButton.disabled = true;
                disconnectButton.style.display = "block"; // Hiển thị nút Disconnect
                noPaymentInfo.style.display = "none";
            } else {
                alert(`❌ Lỗi: ${result.error}`);
            }
        } catch (error) {
            console.error("❌ Lỗi khi kết nối Metamask:", error);
            alert("Có lỗi xảy ra khi kết nối Metamask!");
        }
    }

    // 🟢 Hủy kết nối ví
    async function disconnectWallet() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/wallet/disconnect/${user.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                alert("🔌 Đã hủy kết nối ví thành công!");
                walletInfoContainer.innerHTML = ""; // Xóa thông tin ví khỏi UI
                addWalletButton.innerText = "Add Wallet";
                addWalletButton.disabled = false;
                disconnectButton.style.display = "none"; // Ẩn nút Disconnect
                noPaymentInfo.style.display = "block"; // Hiển thị lại dòng thông báo
            } else {
                alert("❌ Lỗi khi hủy kết nối ví!");
            }
        } catch (error) {
            console.error("❌ Lỗi khi hủy kết nối ví:", error);
        }
    }

    // 🟢 Hiển thị thông tin ví lên UI
    function displayWalletInfo(walletAddress, balance) {
        walletInfoContainer.innerHTML = `
            <p><strong>Wallet Address:</strong> ${walletAddress}</p>
            <p><strong>Balance:</strong> ${balance} Tokens</p>
        `;
        walletInfoContainer.appendChild(disconnectButton); // Thêm nút hủy kết nối vào UI
    }

    checkWalletStatus();
    addWalletButton.addEventListener("click", connectWallet);
    disconnectButton.addEventListener("click", disconnectWallet);
});
