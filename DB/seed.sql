INSERT INTO suppliers (SupplierName, ContactInfo, Address) VALUES 
('Supplier A', 'contact@suppliera.com', '1234 Street, City A'),
('Supplier B', 'contact@supplierb.com', '5678 Avenue, City B'),
('Supplier C', 'contact@supplierc.com', '9101 Drive, City C'),
('Supplier D', 'contact@supplierd.com', '2345 Street, City D'),
('Supplier E', 'contact@suppliere.com', '6789 Avenue, City E'),
('Supplier F', 'contact@supplierf.com', '1011 Drive, City F');

INSERT INTO stock (ProductName, Quantity, Price, SupplierID) VALUES 
('Product 1', 100, 10.00, 1),
('Product 2', 200, 20.00, 2),
('Product 3', 150, 15.50, 3),
('Product 4', 120, 12.00, 4),
('Product 5', 250, 25.00, 5),
('Product 6', 175, 17.50, 6);

INSERT INTO customers (CustomerName, ContactInfo, Address) VALUES 
('Customer A', 'customerA@email.com', '7890 Lane, City X'),
('Customer B', 'customerB@email.com', '4321 Path, City Y'),
('Customer C', 'customerC@email.com', '2468 Road, City Z'),
('Customer D', 'customerD@email.com', '1357 Drive, City W'),
('Customer E', 'customerE@email.com', '8642 Street, City V'),
('Customer F', 'customerF@email.com', '9753 Avenue, City U');

INSERT INTO defaulters (CustomerID, AmountDue, DueDate) VALUES 
(1, 500.00, '2023-12-01'),
(2, 300.00, '2023-12-15'),
(3, 550.00, '2024-01-05'),
(4, 350.00, '2024-01-20');

INSERT INTO inventory (StockID, Quantity, LastUpdated) VALUES 
(1, 80, '2023-11-01'),
(2, 150, '2023-11-10'),
(3, 100, '2023-11-15'),
(4, 85, '2023-11-20'),
(5, 160, '2023-11-25'),
(6, 110, '2023-11-30');

INSERT INTO reorders (StockID, Quantity, OrderDate, ExpectedDelivery) VALUES 
(1, 50, '2023-11-20', '2023-12-05'),
(2, 100, '2023-11-25', '2023-12-10'),
(3, 60, '2023-11-30', '2023-12-15'),
(4, 110, '2023-12-05', '2023-12-20');

INSERT INTO accountspayable (SupplierID, Amount, DueDate) VALUES 
(1, 1000.00, '2023-12-20'),
(2, 750.00, '2023-12-25'),
(3, 1200.00, '2024-01-10'),
(4, 800.00, '2024-01-15');

INSERT INTO accountsreceivable (CustomerID, Amount, DueDate) VALUES 
(1, 1200.00, '2023-12-30'),
(2, 800.00, '2023-11-30'),
(3, 1300.00, '2024-01-25'),
(4, 900.00, '2024-02-05');

INSERT INTO profitfulfillment (Date, TotalSales, TotalCost) VALUES 
('2023-11-24', 5000.00, 3000.00),
('2023-11-25', 4500.00, 2500.00),
('2023-12-04', 5500.00, 3500.00),
('2023-12-05', 6000.00, 4000.00);

INSERT INTO fulfillmentdate (StockID, CustomerID, RequiredQuantity, FulfillmentDate) VALUES 
(1, 1, 20, '2023-12-05'),
(2, 2, 15, '2023-12-10'),
(3, 3, 25, '2023-12-15'),
(4, 4, 30, '2023-12-20');
