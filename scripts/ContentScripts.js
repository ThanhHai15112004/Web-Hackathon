const API_URL = "http://localhost:5000/api/products"; // API Backend

document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("content_product-list");
    const seeAllBtn = document.getElementById("see-all-btn");

    if (!seeAllBtn) {
        console.error("❌ Error: see-all-btn not found in DOM!");
        return;
    }

    try {
        const response = await fetch(API_URL);
        const allProducts = await response.json();

        console.log("✅ Fetched Products:", allProducts);

        // Hiển thị 5 sản phẩm đầu tiên trên trang chính
        renderProducts(allProducts.slice(0, 5));
        
    } catch (error) {
        console.error("❌ Fetch error:", error);
    }
});

// Hiển thị danh sách 5 sản phẩm trên `index.html`
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

    console.log(`✅ Rendered ${products.length} products.`);
}
