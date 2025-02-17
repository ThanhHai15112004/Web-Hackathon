create database ShoesStore
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
