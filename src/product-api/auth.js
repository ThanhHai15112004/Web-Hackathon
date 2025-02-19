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
        const { first_name, last_name, email, phone, password } = req.body;
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.status(401).json({ error: "Không có quyền truy cập!" });

        const decoded = jwt.verify(token, SECRET_KEY);
        const pool = await poolPromise;

        // 🟢 Kiểm tra nếu không có first_name hoặc last_name, giữ nguyên giá trị cũ
        const user = await pool.request()
            .input("id", sql.VarChar, decoded.id)
            .query("SELECT first_name, last_name, email, phone FROM users WHERE id = @id");

        if (user.recordset.length === 0) {
            return res.status(404).json({ error: "User không tồn tại!" });
        }

        const currentUser = user.recordset[0];

        const newFirstName = first_name || currentUser.first_name;
        const newLastName = last_name || currentUser.last_name;
        const newEmail = email || currentUser.email;
        const newPhone = phone || currentUser.phone;

        // 🟢 Kiểm tra nếu có password mới, mã hóa trước khi lưu
        let hashedPassword = null;
        if (password && password.trim() !== "") {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // 🟢 Câu lệnh SQL: cập nhật các giá trị mới (nếu có)
        let updateQuery = `
            UPDATE users 
            SET first_name=@first_name, last_name=@last_name, email=@email, phone=@phone
            ${hashedPassword ? ", password=@password" : ""}
            WHERE id=@id
        `;

        const updateRequest = pool.request()
            .input("id", sql.VarChar, decoded.id)
            .input("first_name", sql.NVarChar, newFirstName)
            .input("last_name", sql.NVarChar, newLastName)
            .input("email", sql.NVarChar, newEmail)
            .input("phone", sql.NVarChar, newPhone);

        if (hashedPassword) {
            updateRequest.input("password", sql.NVarChar, hashedPassword);
        }

        await updateRequest.query(updateQuery);

        // 🟢 Trả về user đã cập nhật
        const updatedUser = await pool.request()
            .input("id", sql.VarChar, decoded.id)
            .query("SELECT id, first_name, last_name, email, phone FROM users WHERE id = @id");

        res.json({ message: "Cập nhật thành công!", user: updatedUser.recordset[0] });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
