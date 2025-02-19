const express = require("express");
const { sql, poolPromise } = require("./db");
const router = express.Router();

// 🟢 API lấy thông tin ví của user
router.get("/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("user_id", sql.VarChar, user_id)
            .query(`
                SELECT wallet_address, ISNULL(wallet_balance, 0) AS wallet_balance
                FROM Wallets WHERE user_id = @user_id
            `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: "User chưa liên kết ví" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 API liên kết ví với tài khoản user
router.post("/connect", async (req, res) => {
    try {
        const { user_id, wallet_address } = req.body;
        const pool = await poolPromise;

        // 🟢 Kiểm tra user có đang liên kết ví không
        const checkUserWallet = await pool.request()
            .input("user_id", sql.VarChar, user_id)
            .query("SELECT * FROM Wallets WHERE user_id = @user_id");

        if (checkUserWallet.recordset.length > 0) {
            return res.status(400).json({ error: "User này đã có ví!" });
        }

        // 🟢 Thêm ví mới vào bảng Wallets
        await pool.request()
            .input("user_id", sql.VarChar, user_id)
            .input("wallet_address", sql.NVarChar, wallet_address)
            .query(`
                INSERT INTO Wallets (user_id, wallet_address, wallet_balance) 
                VALUES (@user_id, @wallet_address, 0)
            `);

        // 🟢 Cập nhật users.wallet_address với địa chỉ ví mới
        await pool.request()
            .input("user_id", sql.VarChar, user_id)
            .input("wallet_address", sql.NVarChar, wallet_address)
            .query(`
                UPDATE users SET wallet_address = @wallet_address WHERE id = @user_id
            `);

        res.json({ message: "Ví đã liên kết thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 🟢 API hủy kết nối ví
router.delete("/disconnect/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input("user_id", sql.VarChar, user_id)
            .query("DELETE FROM Wallets WHERE user_id = @user_id");

        await pool.request()
            .input("user_id", sql.VarChar, user_id)
            .query("UPDATE users SET wallet_address = NULL, wallet_balance = 0 WHERE id = @user_id");

        res.json({ message: "Ví đã hủy kết nối thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
