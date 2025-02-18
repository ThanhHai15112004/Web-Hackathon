const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sql, poolPromise } = require("./db");
const authRoutes = require("./auth");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🟢 API Người Dùng (Đăng ký, Đăng nhập, Cập nhật user)
app.use("/api/auth", authRoutes);

// 🟢 API Lấy danh sách sản phẩm
app.get("/api/products", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Products");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 API Thêm sản phẩm mới (ID nhập tay)
app.post("/api/products", async (req, res) => {
    try {
        const { id, name, description, price, image } = req.body;

        if (!id || !name || !price) {
            return res.status(400).json({ error: "ID, name, and price are required" });
        }

        const pool = await poolPromise;

        // Kiểm tra xem ID có bị trùng không
        const checkId = await pool.request()
            .input("id", sql.VarChar, id)
            .query("SELECT id FROM Products WHERE id = @id");

        if (checkId.recordset.length > 0) {
            return res.status(400).json({ error: "Product ID already exists" });
        }

        await pool.request()
            .input("id", sql.VarChar, id)
            .input("name", sql.NVarChar, name)
            .input("description", sql.NVarChar, description)
            .input("price", sql.Decimal(10, 2), price)
            .input("image", sql.NVarChar, image)
            .query("INSERT INTO Products (id, name, description, price, image) VALUES (@id, @name, @description, @price, @image)");

        res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 API Xóa sản phẩm (ID là VARCHAR)
app.delete("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input("id", sql.VarChar, id)
            .query("DELETE FROM Products WHERE id = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 API Cập nhật sản phẩm (ID là VARCHAR)
app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image } = req.body;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("id", sql.VarChar, id)
            .input("name", sql.NVarChar, name)
            .input("description", sql.NVarChar, description)
            .input("price", sql.Decimal(10, 2), price)
            .input("image", sql.NVarChar, image)
            .query("UPDATE Products SET name=@name, description=@description, price=@price, image=@image WHERE id=@id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🚀 Khởi chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
