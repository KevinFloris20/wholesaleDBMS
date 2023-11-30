-- Schema for Wholesaler Database
-- DROP DATABASE IF EXISTS WholesalerDB;
-- CREATE DATABASE WholesalerDB;
-- USE WholesalerDB;
-- Use a specific database or create a new one
-- CREATE DATABASE IF NOT EXISTS WholesalerDB;
DROP DATABASE IF EXISTS WholesalerDB;
CREATE DATABASE WholesalerDB;
USE WholesalerDB;

CREATE TABLE suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    SupplierName VARCHAR(255) NOT NULL,
    ContactInfo VARCHAR(255),
    Address VARCHAR(255)
);

CREATE TABLE stock (
    StockID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    SupplierID INT,
    CONSTRAINT fk_stock_supplier FOREIGN KEY (SupplierID) REFERENCES suppliers(SupplierID) ON DELETE SET NULL
);

CREATE TABLE customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerName VARCHAR(255) NOT NULL,
    ContactInfo VARCHAR(255),
    Address VARCHAR(255)
);

CREATE TABLE defaulters (
    DefaulterID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT,
    AmountDue DECIMAL(10, 2) NOT NULL,
    DueDate DATE NOT NULL,
    CONSTRAINT fk_defaulters_customer FOREIGN KEY (CustomerID) REFERENCES customers(CustomerID) ON DELETE SET NULL
);

CREATE TABLE inventory (
    InventoryID INT AUTO_INCREMENT PRIMARY KEY,
    StockID INT,
    Quantity INT NOT NULL,
    LastUpdated DATE NOT NULL,
    CONSTRAINT fk_inventory_stock FOREIGN KEY (StockID) REFERENCES stock(StockID) ON DELETE SET NULL
);

CREATE TABLE reorders (
    ReorderID INT AUTO_INCREMENT PRIMARY KEY,
    StockID INT,
    Quantity INT NOT NULL,
    OrderDate DATE NOT NULL,
    ExpectedDelivery DATE,
    CONSTRAINT fk_reorders_stock FOREIGN KEY (StockID) REFERENCES stock(StockID) ON DELETE SET NULL
);

CREATE TABLE accountspayable (
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    SupplierID INT,
    Amount DECIMAL(10, 2) NOT NULL,
    DueDate DATE NOT NULL,
    CONSTRAINT fk_accountspayable_supplier FOREIGN KEY (SupplierID) REFERENCES suppliers(SupplierID) ON DELETE SET NULL
);

CREATE TABLE accountsreceivable (
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT,
    Amount DECIMAL(10, 2) NOT NULL,
    DueDate DATE NOT NULL,
    CONSTRAINT fk_accountsreceivable_customer FOREIGN KEY (CustomerID) REFERENCES customers(CustomerID) ON DELETE SET NULL
);

CREATE TABLE profitfulfillment (
    RecordID INT AUTO_INCREMENT PRIMARY KEY,
    Date DATE NOT NULL,
    TotalSales DECIMAL(10, 2) NOT NULL,
    TotalCost DECIMAL(10, 2) NOT NULL,
    Profit DECIMAL(10, 2) GENERATED ALWAYS AS (TotalSales - TotalCost) STORED
);

CREATE TABLE fulfillmentdate(
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    StockID INT,
    CustomerID INT,
    RequiredQuantity INT NOT NULL,
    FulfillmentDate DATE,
    IsFulfilled BOOLEAN,
    CONSTRAINT fk_fulfillmentdate_stock FOREIGN KEY (StockID) REFERENCES stock(StockID) ON DELETE SET NULL,
    CONSTRAINT fk_fulfillmentdate_customer FOREIGN KEY (CustomerID) REFERENCES customers(CustomerID) ON DELETE SET NULL
);


DELIMITER $$

CREATE TRIGGER before_insert_fulfillmentdate
BEFORE INSERT ON fulfillmentdate
FOR EACH ROW
BEGIN
    IF NEW.IsFulfilled IS NULL THEN
        IF NEW.FulfillmentDate < CURDATE() THEN
            SET NEW.IsFulfilled = TRUE;
        ELSE
            SET NEW.IsFulfilled = FALSE;
        END IF;
    END IF;
END$$

DELIMITER ;



-- 11/27/2023
-- CREATE DATABASE IF NOT EXISTS WholesalerDB;
-- USE WholesalerDB;


-- CREATE TABLE Suppliers (
--     SupplierID INT AUTO_INCREMENT PRIMARY KEY,
--     SupplierName VARCHAR(255) NOT NULL,
--     ContactInfo VARCHAR(255),
--     Address VARCHAR(255)
-- );


-- CREATE TABLE Stock (
--     StockID INT AUTO_INCREMENT PRIMARY KEY,
--     ProductName VARCHAR(255) NOT NULL,
--     Quantity INT NOT NULL,
--     Price DECIMAL(10, 2) NOT NULL,
--     SupplierID INT,
--     FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
-- );


-- CREATE TABLE Customers (
--     CustomerID INT AUTO_INCREMENT PRIMARY KEY,
--     CustomerName VARCHAR(255) NOT NULL,
--     ContactInfo VARCHAR(255),
--     Address VARCHAR(255)
-- );


-- CREATE TABLE Defaulters (
--     DefaulterID INT AUTO_INCREMENT PRIMARY KEY,
--     CustomerID INT,
--     AmountDue DECIMAL(10, 2) NOT NULL,
--     DueDate DATE NOT NULL,
--     FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
-- );


-- CREATE TABLE Inventory (
--     InventoryID INT AUTO_INCREMENT PRIMARY KEY,
--     StockID INT,
--     Quantity INT NOT NULL,
--     LastUpdated DATE NOT NULL,
--     FOREIGN KEY (StockID) REFERENCES Stock(StockID)
-- );


-- CREATE TABLE Reorders (
--     ReorderID INT AUTO_INCREMENT PRIMARY KEY,
--     StockID INT,
--     Quantity INT NOT NULL,
--     OrderDate DATE NOT NULL,
--     ExpectedDelivery DATE,
--     FOREIGN KEY (StockID) REFERENCES Stock(StockID)
-- );


-- CREATE TABLE AccountsPayable (
--     AccountID INT AUTO_INCREMENT PRIMARY KEY,
--     SupplierID INT,
--     Amount DECIMAL(10, 2) NOT NULL,
--     DueDate DATE NOT NULL,
--     FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
-- );


-- CREATE TABLE AccountsReceivable (
--     AccountID INT AUTO_INCREMENT PRIMARY KEY,
--     CustomerID INT,
--     Amount DECIMAL(10, 2) NOT NULL,
--     DueDate DATE NOT NULL,
--     FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
-- );


-- CREATE TABLE ProfitFulfillment (
--     RecordID INT AUTO_INCREMENT PRIMARY KEY,
--     Date DATE NOT NULL,
--     TotalSales DECIMAL(10, 2) NOT NULL,
--     TotalCost DECIMAL(10, 2) NOT NULL,
--     Profit DECIMAL(10, 2) GENERATED ALWAYS AS (TotalSales - TotalCost) STORED
-- );



-- CREATE TABLE FulfillmentDate (
--     OrderID INT AUTO_INCREMENT PRIMARY KEY,
--     StockID INT,
--     CustomerID INT,
--     RequiredQuantity INT NOT NULL,
--     FulfillmentDate DATE,
--     FOREIGN KEY (StockID) REFERENCES Stock(StockID),
--     FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
-- );


-- updated the database with this:
-- USE WholesalerDB;

-- ALTER TABLE stock DROP FOREIGN KEY stock_ibfk_1;
-- ALTER TABLE stock ADD CONSTRAINT stock_ibfk_1 FOREIGN KEY (supplierid) REFERENCES suppliers(supplierid) ON DELETE SET NULL;

-- ALTER TABLE defaulters DROP FOREIGN KEY defaulters_ibfk_1;
-- ALTER TABLE defaulters ADD CONSTRAINT defaulters_ibfk_1 FOREIGN KEY (customerid) REFERENCES customers(customerid) ON DELETE SET NULL;

-- ALTER TABLE inventory DROP FOREIGN KEY inventory_ibfk_1;
-- ALTER TABLE inventory ADD CONSTRAINT inventory_ibfk_1 FOREIGN KEY (stockid) REFERENCES stock(stockid) ON DELETE SET NULL;

-- ALTER TABLE reorders DROP FOREIGN KEY reorders_ibfk_1;
-- ALTER TABLE reorders ADD CONSTRAINT reorders_ibfk_1 FOREIGN KEY (stockid) REFERENCES stock(stockid) ON DELETE SET NULL;

-- ALTER TABLE accountspayable DROP FOREIGN KEY accountspayable_ibfk_1;
-- ALTER TABLE accountspayable ADD CONSTRAINT accountspayable_ibfk_1 FOREIGN KEY (supplierid) REFERENCES suppliers(supplierid) ON DELETE SET NULL;
