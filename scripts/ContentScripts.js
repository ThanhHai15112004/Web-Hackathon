const API_URL = "http://localhost:5000/api/products"; // API Backend

document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("content_product-list");
    const seeAllBtn = document.getElementById("see-all-btn");

    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        renderProducts(products.slice(0, 5)); // Hiển thị 5 sản phẩm đầu tiên

        if (products.length > 5) {
            seeAllBtn.style.display = "inline"; // Hiển thị nút See All
            seeAllBtn.addEventListener("click", () => {
                renderProducts(products); // Hiển thị tất cả sản phẩm
                seeAllBtn.style.display = "none"; // Ẩn nút sau khi nhấn
            });
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
});

function renderProducts(products) {
    const productList = document.getElementById("content_product-list");
    productList.innerHTML = ""; // Xóa danh sách cũ

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("content_product-card");

        productCard.innerHTML = `
            <span class="heart-icon">❤️</span>
            <div class="image-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <p class="title-product">${product.name}</p>
            <div class="price">$${product.price}</div>
        `;

        productList.appendChild(productCard);
    });
}
