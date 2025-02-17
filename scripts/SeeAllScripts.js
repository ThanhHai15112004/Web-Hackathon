const API_URL = "http://localhost:5000/api/products";
const ITEMS_PER_PAGE = 30; // 5 cột x 6 hàng = 30 sản phẩm mỗi trang
let currentPage = 1;
let totalPages = 1;
let allProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(API_URL);
        allProducts = await response.json();
        totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);

        // Hiển thị trang đầu tiên
        renderPagination();
        loadPage(1);
    } catch (error) {
        console.error("❌ Fetch error:", error);
    }
});

// Hiển thị sản phẩm theo từng trang
function loadPage(page) {
    currentPage = page;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    renderProducts(allProducts.slice(startIndex, endIndex));
    updatePagination();
}

// Tạo danh sách sản phẩm
function renderProducts(products) {
    const productList = document.getElementById("content_product-list");
    productList.innerHTML = "";

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

// Tạo phân trang
function renderPagination() {
    let paginationContainer = document.getElementById("pagination");

    paginationContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("div");
        pageItem.classList.add("page-item");
        pageItem.innerText = i;
        pageItem.addEventListener("click", () => loadPage(i));
        paginationContainer.appendChild(pageItem);
    }

    updatePagination();
}

// Cập nhật trạng thái active cho trang hiện tại
function updatePagination() {
    document.querySelectorAll(".page-item").forEach((item, index) => {
        item.classList.toggle("active", index + 1 === currentPage);
    });

    console.log(`✅ Current Page: ${currentPage}`);
}
