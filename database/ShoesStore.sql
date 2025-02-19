create database ShoesStore
go
use database ShoesStore
go
CREATE TABLE Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    image NVARCHAR(500)
);
go
INSERT INTO Products (id, name, description, price, image) 
VALUES 
    ('SP004', 'Jordan 4 Retro Military Blue (2024)', null, 118, 'https://images.stockx.com/360/Nike-Kobe-4-Protro-Gold-Medal-2024/Images/Nike-Kobe-4-Protro-Gold-Medal-2024/Lv2/img01.jpg?w=576&q=60&dpr=1&updated_at=1722622306&h=384'),
    ('SP005', 'Nike Kobe 9 Elite Protro Christmas (2024)', null, 160, 'https://images.stockx.com/360/Nike-Kobe-9-Elite-Protro-Christmas-2024/Images/Nike-Kobe-9-Elite-Protro-Christmas-2024/Lv2/img01.jpg?w=576&q=57&dpr=2&updated_at=1734038498&h=384'),
    ('SP006', 'Nike Kobe 8 Protro Court Purple', null, 141, 'https://images.stockx.com/360/Nike-Kobe-8-Protro-Court-Purple/Images/Nike-Kobe-8-Protro-Court-Purple/Lv2/img01.jpg?w=576&q=57&dpr=2&updated_at=1706801069&h=384'),
    ('SP007', 'Nike Kobe 8 Protro Radiant Emerald', null, 139, 'https://images.stockx.com/360/Nike-Kobe-8-Protro-Radiant-Emerald/Images/Nike-Kobe-8-Protro-Radiant-Emerald/Lv2/img01.jpg?w=576&q=57&dpr=2&updated_at=1707924145&h=384'),
    ('SP008', 'Jordan 4 Retro White Cement (2025)', null, 399, 'https://images.stockx.com/images/Air-Jordan-4-Retro-White-Cement-2025.jpg?fit=fill&bg=FFFFFF&w=576&h=384&q=60&dpr=1&trim=color&updated_at=1739765985');


go
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    first_name NVARCHAR(255) NOT NULL,
    last_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NULL,
    wallet_address NVARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE()
);
go
ALTER TABLE users 
ADD wallet_balance DECIMAL(18,8) DEFAULT 0; -- Lưu số dư token trong tài khoản
go

ALTER TABLE Wallets 
ADD wallet_balance DECIMAL(18,8) DEFAULT 0;

go
CREATE TABLE Wallets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    wallet_address NVARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
go
CREATE TABLE Orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Shipped', 'Completed'
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
go
CREATE TABLE OrderDetails (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id varchar(100) NOT NULL,  -- 🔹 Đảm bảo kiểu dữ liệu là INT
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

go
CREATE TABLE Transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    wallet_id INT NOT NULL,
    transaction_type NVARCHAR(50) NOT NULL CHECK (transaction_type IN ('Deposit', 'Withdraw')),
    amount DECIMAL(18, 8) NOT NULL,
    status NVARCHAR(50) DEFAULT 'Pending',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (wallet_id) REFERENCES Wallets(id)
);

go
ALTER TABLE Orders ADD 
    payment_status NVARCHAR(50) DEFAULT 'Pending',
    payment_method NVARCHAR(50) DEFAULT 'Wallet';

go

CREATE TABLE Invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    order_id INT NOT NULL,
    total_amount DECIMAL(18,8) NOT NULL,
    status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Paid, Failed
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (order_id) REFERENCES Orders(id)
);

go

ALTER TABLE Transactions 
ADD order_id INT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id);

ALTER TABLE Transactions 
ADD CONSTRAINT CHK_TransactionType 
CHECK (transaction_type IN ('Deposit', 'Withdraw', 'Payment'));


go

CREATE TABLE Payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id INT NOT NULL,
    wallet_id INT NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    payment_status NVARCHAR(50) DEFAULT 'Processing', -- Processing, Completed, Failed
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (invoice_id) REFERENCES Invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES Wallets(id) ON DELETE CASCADE
);


go

CREATE TRIGGER SyncWalletBalance
ON Wallets
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE users
    SET wallet_balance = inserted.wallet_balance
    FROM users
    INNER JOIN inserted ON users.id = inserted.user_id;
END;
