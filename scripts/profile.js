document.addEventListener("DOMContentLoaded", async () => {
    const editBtn = document.querySelector(".edit-button");
    let isEditing = false;

    async function fetchUserData() {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/me", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem("user", JSON.stringify(user));

                document.getElementById("name").innerText = `${user.first_name} ${user.last_name}`;
                document.getElementById("phone").innerText = user.phone || "No Phone";
                document.getElementById("email").innerText = user.email;
                document.getElementById("password").innerText = "********";

                document.getElementById("sidebar-name").innerText = `${user.first_name} ${user.last_name}`;
            } else {
                window.location.href = "login.html";
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
        }
    }

    fetchUserData();

    editBtn.addEventListener("click", () => {
        if (!isEditing) {
            isEditing = true;
            editBtn.innerText = "Save";

            const nameParts = document.getElementById("name").innerText.split(" ");
            const firstName = nameParts.slice(0, -1).join(" ") || "";
            const lastName = nameParts[nameParts.length - 1] || "";

            document.getElementById("name").innerHTML = `
                <input type="text" id="edit-firstname" value="${firstName}">
                <input type="text" id="edit-lastname" value="${lastName}">
            `;
            document.getElementById("phone").innerHTML = `<input type="text" id="edit-phone" value="${document.getElementById("phone").innerText}">`;
            document.getElementById("email").innerHTML = `<input type="email" id="edit-email" value="${document.getElementById("email").innerText}">`;
            document.getElementById("password").innerHTML = `<input type="password" id="edit-password" placeholder="New password (optional)">`;
        } else {
            const updatedUser = {
                first_name: document.getElementById("edit-firstname").value,
                last_name: document.getElementById("edit-lastname").value,
                phone: document.getElementById("edit-phone").value,
                email: document.getElementById("edit-email").value,
            };

            const newPassword = document.getElementById("edit-password").value.trim();
            if (newPassword) {
                updatedUser.password = newPassword;
            }

            updateUserData(updatedUser);
        }
    });

    async function updateUserData(updatedUser) {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5000/api/auth/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedUser)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Cập nhật thành công!");

                localStorage.setItem("user", JSON.stringify(result.user));

                fetchUserData();
                isEditing = false;
                editBtn.innerText = "Edit";
            } else {
                alert(result.error || "Có lỗi khi cập nhật.");
            }
        } catch (error) {
            alert("Lỗi kết nối máy chủ!");
            console.error(error);
        }
    }
});
