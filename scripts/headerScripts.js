document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".mainnav-links a");

    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn load lại trang
            
            // Xóa class active khỏi tất cả các mục
            navLinks.forEach(item => item.classList.remove("active"));
            
            // Thêm class active vào mục được click
            this.classList.add("active");
        });
    });
});