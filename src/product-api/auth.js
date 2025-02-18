const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("./db");
require("dotenv").config();

const router = express.Router();
const SECRET_KEY = "mysecretkey"; // Thay bằng key bảo mật của bạn

// 🟢 API Đăng Ký
router.post("/signup", async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone } = req.body;
        console.log("📥 Đăng ký người dùng:", email);

        const pool = await poolPromise;

        // Kiểm tra email đã tồn tại chưa
        const checkUser = await pool.request()
            .input("email", sql.NVarChar, email)
            .query("SELECT * FROM users WHERE email = @email");

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ error: "Email đã được sử dụng!" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu user vào database
        await pool.request()
            .input("id", sql.VarChar, Date.now().toString())
            .input("first_name", sql.NVarChar, first_name)
            .input("last_name", sql.NVarChar, last_name)
            .input("email", sql.NVarChar, email)
            .input("password", sql.NVarChar, hashedPassword)
            .input("phone", sql.NVarChar, phone)
            .query("INSERT INTO users (id, first_name, last_name, email, password, phone) VALUES (@id, @first_name, @last_name, @email, @password, @phone)");

        console.log("✅ Đăng ký thành công:", email);
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        console.error("❌ Lỗi đăng ký:", error.message);
        res.status(500).json({ error: error.message });
    }
});



// 🟢 API Đăng Nhập
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await poolPromise;

        // Kiểm tra email có tồn tại không
        const user = await pool.request()
            .input("email", sql.NVarChar, email)
            .query("SELECT * FROM users WHERE email = @email");

        if (user.recordset.length === 0) {
            return res.status(400).json({ error: "Email không tồn tại!" });
        }

        const validPassword = await bcrypt.compare(password, user.recordset[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: "Sai mật khẩu!" });
        }

        // Tạo token JWT
        const token = jwt.sign({ id: user.recordset[0].id }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ token, user: user.recordset[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 API Lấy Thông Tin User
router.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.status(401).json({ error: "Không có quyền truy cập!" });

        const decoded = jwt.verify(token, SECRET_KEY);
        const pool = await poolPromise;

        const user = await pool.request()
            .input("id", sql.VarChar, decoded.id)
            .query("SELECT id, first_name, last_name, email, phone, wallet_address FROM users WHERE id = @id");

        res.json(user.recordset[0]);
    } catch (error) {
        res.status(401).json({ error: "Token không hợp lệ!" });
    }
});

// 🟢 API Cập Nhật User
router.put("/update", async (req, res) => {
    try {
        const { email, phone, wallet_address } = req.body;
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.status(401).json({ error: "Không có quyền truy cập!" });

        const decoded = jwt.verify(token, SECRET_KEY);
        const pool = await poolPromise;

        await pool.request()
            .input("id", sql.VarChar, decoded.id)
            .input("email", sql.NVarChar, email)
            .input("phone", sql.NVarChar, phone)
            .input("wallet_address", sql.NVarChar, wallet_address)
            .query("UPDATE users SET email=@email, phone=@phone, wallet_address=@wallet_address WHERE id=@id");

        res.json({ message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
