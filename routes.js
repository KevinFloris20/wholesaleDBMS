const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const DBschema = `
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
`

//route for index page
app.get("/", async function (req, res) {
    try {
        const [products, customersData, replenishmentData] = await Promise.all([
            db.getDashProducts(),
            db.getAllCustomers(),
            db.getDashInv()  // Fetching data for inventory replenishment
        ]);

        // Only select all customer names from the customer table
        const customers = customersData.map(customer => customer.CustomerName);

        // Processing replenishment data
        const replenishment = replenishmentData.map(item => {
            return {
                ProductName: item.ProductName,
                SupplierName: item.SupplierName,
                SupplierContact: item.SupplierContact,
                NeedsReplenishment: item.NeedsReplenishment
            };
        });

        res.render("index", {
            products: products,
            customers: customers,
            replenishment: replenishment  // Adding this for the EJS template
        });
    } catch(err) {
        console.error(err);
        res.render("index", { error: err });
    }
});





//require the db queries
const db = require("./DB/queries/query.js");

////////////////////////Gets////////////////////////
//stock page
// Stock
// Suppliers
// Reorders
app.get("/StockDetails", async function (req, res) {
    try{
        const [allStockDetailInfo, allSupplierInfo, getAllReorders, getAllInventory] = await Promise.all([
            db.getAllStock(),
            db.getAllSuppliers(),
            db.getAllReorders(),
            db.getAllInventory()
        ]);

        res.render("stockDetails", {
            allStockDetailInfo: allStockDetailInfo,
            allSupplierInfo: allSupplierInfo,
            getAllReorders: getAllReorders,
            getAllInventory: getAllInventory,
            getQueries:{
                QUERY_GET_ALL_STOCK: db.QUERY_GET_ALL_STOCK,
                QUERY_GET_ALL_SUPPLIERS: db.QUERY_GET_ALL_SUPPLIERS,
                QUERY_GET_ALL_REORDERS: db.QUERY_GET_ALL_REORDERS,
                QUERY_GET_ALL_INVENTORY: db.QUERY_GET_ALL_INVENTORY
            },
            postQueries:{
                QUERY_POST_NEW_STOCK: db.QUERY_POST_NEW_STOCK,
                QUERY_POST_NEW_SUPPLIER: db.QUERY_POST_NEW_SUPPLIER,
                QUERY_POST_NEW_REORDER: db.QUERY_POST_NEW_REORDER,
                QUERY_POST_NEW_INVENTORY: db.QUERY_POST_NEW_INVENTORY
            }
        });

    }catch(err){
        console.log(err);
        res.render("stockDetails",{error: err})
    }
});

//customer page
// Customers
// Defaulters
// AccountsReceivable
// FulfillmentDate 
app.get("/CustomerRelations", async function(req, res){
    try{
        const [allCustomerInfo, allDefaulterInfo, allAccountsReceivable, allFulfillmentDate] = await Promise.all([
            db.getAllCustomers(),
            db.getAllDefaulters(),
            db.getAllAccountsReceivable(),
            db.getAllFulfillmentDates()
        ]);
        res.render("costomerRel", {
            allCustomerInfo: allCustomerInfo,
            allDefaulterInfo: allDefaulterInfo,
            allAccountsReceivable: allAccountsReceivable,
            allFulfillmentDate: allFulfillmentDate,
            getQueries:{
                QUERY_GET_ALL_CUSTOMERS: db.QUERY_GET_ALL_CUSTOMERS,
                QUERY_GET_ALL_DEFAULTERS: db.QUERY_GET_ALL_DEFAULTERS,
                QUERY_GET_ALL_ACCOUNTS_RECEIVABLE: db.QUERY_GET_ALL_ACCOUNTS_RECEIVABLE,
                QUERY_GET_ALL_FULFILLMENT_DATES: db.QUERY_GET_ALL_FULFILLMENT_DATES
            },
            postQueries:{
                QUERY_POST_NEW_CUSTOMER: db.QUERY_POST_NEW_CUSTOMER,
                QUERY_POST_NEW_DEFAULTERS: db.QUERY_POST_NEW_DEFAULTERS,
                QUERY_POST_NEW_ACCOUNTS_RECEIVABLE: db.QUERY_POST_NEW_ACCOUNTS_RECEIVABLE,
                QUERY_POST_NEW_FULFILLMENT_DATE: db.QUERY_POST_NEW_FULFILLMENT_DATE
            }
        });
    }catch(err){
        console.log(err);
        res.render("costomerRel",{error: err})
    }
});

//Financials page
// AccountsPayable
// AccountsReceivable (also relevant to Customer Relations)
// Defaulters (also relevant to Customer Relations)
// ProfitFulfillment (for tracking profit)
app.get("/Financials", async function(req, res){
    try{
        const [allAccountsPayable, allAccountsReceivable, allDefaulters, allProfitFulfillment, totalAccountsReceivable, totalAccountsPayable, netAccount, projProfit] = await Promise.all([
            db.getAllAccountsPayable(),
            db.getAllAccountsReceivable(),
            db.getAllDefaulters(),
            db.getAllProfitFulfillment(),
            db.getTotalAccountsReceivable(),
            db.getTotalAccountsPayable(),
            db.getNetAccounts(),
            db.getTotalProfitFulfillment()
        ]);
        res.render("financials", {
            allAccountsPayable: allAccountsPayable,
            allAccountsReceivable: allAccountsReceivable,
            allDefaulters: allDefaulters,
            allProfitFulfillment: allProfitFulfillment,
            totalAccountsReceivable: totalAccountsReceivable,
            totalAccountsPayable: totalAccountsPayable,
            netAccount: netAccount,
            projProfit: projProfit,
            getQueries:{
                QUERY_GET_ALL_ACCOUNTS_PAYABLE: db.QUERY_GET_ALL_ACCOUNTS_PAYABLE,
                QUERY_GET_ALL_ACCOUNTS_RECEIVABLE: db.QUERY_GET_ALL_ACCOUNTS_RECEIVABLE,
                QUERY_GET_ALL_DEFAULTERS: db.QUERY_GET_ALL_DEFAULTERS,
                QUERY_GET_ALL_PROFIT_FULFILLMENT: db.QUERY_GET_ALL_PROFIT_FULFILLMENT
            },
            postQueries:{
                QUERY_POST_NEW_ACCOUNTS_PAYABLE: db.QUERY_POST_NEW_ACCOUNTS_PAYABLE,
                QUERY_POST_NEW_ACCOUNTS_RECEIVABLE: db.QUERY_POST_NEW_ACCOUNTS_RECEIVABLE,
                QUERY_POST_NEW_DEFAULTERS: db.QUERY_POST_NEW_DEFAULTERS,
                QUERY_POST_NEW_PROFIT_FULFILLMENT: db.QUERY_POST_NEW_PROFIT_FULFILLMENT
            }
        });
    }catch(err){
        console.log(err);
        res.render("financials",{error: err})
    }
});

//Reports page
// ProfitFulfillment (as it provides data for profit analysis)
// Reorders 
app.get("/Reports", async function(req, res){
    try{
        const [allProfitFulfillment, allReorders, orderInvReport] = await Promise.all([
            db.getAllProfitFulfillment(),
            db.getAllReorders(),
            db.getOrderInvReport()
        ]);
        res.render("reports", {
            allProfitFulfillment: allProfitFulfillment,
            allReorders: allReorders,
            orderInvReport: orderInvReport,
        });
    }catch(err){
        console.log(err);
        res.render("reports",{error: err})
    }
});

//User Management page
app.get("/UserManage", function(req, res){
    res.render("userManage");
});

//Documentation page
app.get("/doc", function(req, res){
    res.render("doc");
});

//DBQueries page
app.get("/DBQueries", function(req, res) {
    res.render("showDBQ", {
        QUERY_GET_ALL_SUPPLIERS: db.QUERY_GET_ALL_SUPPLIERS,
        QUERY_GET_ALL_STOCK: db.QUERY_GET_ALL_STOCK,
        QUERY_GET_ALL_CUSTOMERS: db.QUERY_GET_ALL_CUSTOMERS,
        QUERY_GET_ALL_DEFAULTERS: db.QUERY_GET_ALL_DEFAULTERS,
        QUERY_GET_ALL_INVENTORY: db.QUERY_GET_ALL_INVENTORY,
        QUERY_GET_ALL_REORDERS: db.QUERY_GET_ALL_REORDERS,
        QUERY_GET_ALL_ACCOUNTS_PAYABLE: db.QUERY_GET_ALL_ACCOUNTS_PAYABLE,
        QUERY_GET_ALL_ACCOUNTS_RECEIVABLE: db.QUERY_GET_ALL_ACCOUNTS_RECEIVABLE,
        QUERY_GET_ALL_PROFIT_FULFILLMENT: db.QUERY_GET_ALL_PROFIT_FULFILLMENT,
        QUERY_GET_ALL_FULFILLMENT_DATES: db.QUERY_GET_ALL_FULFILLMENT_DATES,
        QUERY_POST_NEW_STOCK: db.QUERY_POST_NEW_STOCK,
        QUERY_POST_NEW_CUSTOMER: db.QUERY_POST_NEW_CUSTOMER,
        QUERY_POST_NEW_FULFILLMENT_DATE: db.QUERY_POST_NEW_FULFILLMENT_DATE,
        QUERY_POST_NEW_RECEIVABLES: db.QUERY_POST_NEW_RECEIVABLES,
        QUERY_POST_NEW_DEFAULTERS: db.QUERY_POST_NEW_DEFAULTERS,
        QUERY_POST_NEW_REORDER: db.QUERY_POST_NEW_REORDER,
        QUERY_POST_NEW_SUPPLIER: db.QUERY_POST_NEW_SUPPLIER,
        QUERY_POST_NEW_PROFIT_FULFILLMENT: db.QUERY_POST_NEW_PROFIT_FULFILLMENT,
        QUERY_POST_NEW_ACCOUNTS_PAYABLE: db.QUERY_POST_NEW_ACCOUNTS_PAYABLE,
        QUERY_POST_NEW_ACCOUNTS_RECEIVABLE: db.QUERY_POST_NEW_ACCOUNTS_RECEIVABLE,
        QUERY_POST_NEW_INVENTORY: db.QUERY_POST_NEW_INVENTORY,
        QUERY_GET_TOTALUNITS_REPORT: db.QUERY_GET_TOTALUNITS_REPORT,
        QUERY_GET_SUPPLIERWEIGHT_REPORT: db.QUERY_GET_SUPPLIERWEIGHT_REPORT,
        QUERY_GET_TOTALACCOUNTSRECEIVABLE: db.QUERY_GET_TOTALACCOUNTSRECEIVABLE,
        QUERY_GET_TOTALACCOUNTSPAYABLE: db.QUERY_GET_TOTALACCOUNTSPAYABLE,
        QUERY_GET_NETACCOUNTS: db.QUERY_GET_NETACCOUNTS,
        QUERY_GET_TOTALPROFITFUFIL: db.QUERY_GET_TOTALPROFITFUFIL,
        QUERY_GET_RECIEVABLES_AND_DEFAULTERS: db.QUERY_GET_RECIEVABLES_AND_DEFAULTERS,
        QUERY_GET_ORDER_INV_REPORT: db.QUERY_GET_ORDER_INV_REPORT,
        QUERY_GET_DASH_PROD: db.QUERY_GET_DASH_PROD,
        QUERY_GET_DASH_INVV: db.QUERY_GET_DASH_INVV,
        Schema: DBschema
    });
});



////////////////////////Posts////////////////////////


function reformatDate(dateStr) {
    let parts = dateStr.match(/(\d+)/g); 

    if (!parts || parts.length !== 3) {
        return null; 
    }

    let day, month, year;

    if (dateStr.includes('/')) {
        if (parseInt(parts[0]) <= 12) {
            [month, day, year] = parts;
        } else {
            [day, month, year] = parts;
        }
    } else if (dateStr.includes('-')) {
        if (parts[0].length === 4) {
            [year, month, day] = parts;
        } else {
            [day, month, year] = parts;
        }
    } else {
        return null; 
    }

    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    return `${year}-${month}-${day}`;
}




//for customer relations page
//CustomerName, ContactInfo, Address
app.post('/add-customer-c', async (req, res) => {
    const customerData = req.body; 
    const values = [customerData.CustomerName, customerData.ContactInfo, customerData.Address];
    try {
        await db.postNewCustomer(values);
        res.redirect('/CustomerRelations');
    } catch (error) {
        console.error('Error posting new customer data:', error);
        res.status(500).send('Error adding new customer data');
    }
});
//CustomerID, Amount, DueDate
app.post('/add-receivables-c', async (req, res) => {
    const receivablesData = req.body; 
    receivablesData.DueDate = reformatDate(receivablesData.DueDate);
    const values = [receivablesData.CustomerID, receivablesData.Amount, receivablesData.DueDate];
    try {
        await db.postNewReceivables(values);
        res.redirect('/CustomerRelations');
    } catch (error) {
        console.error('Error posting new receivables data:', error);
        res.status(500).send('Error adding new receivables data');
    }
});
//StockID, CustomerID, RequiredQuantity, FulfillmentDate
app.post('/add-fulfillmentDate-c', async (req, res) => {
    const fuldateData = req.body; 
    fuldateData.FulfillmentDate = reformatDate(fuldateData.FulfillmentDate);
    const values = [fuldateData.StockID, fuldateData.CustomerID, fuldateData.RequiredQuantity, fuldateData.FulfillmentDate, null];
    try {
        await db.postNewfulfillmentDate(values);
        res.redirect('/CustomerRelations');
    } catch (error) {
        console.error('Error posting new fulfillment date data:', error);
        res.status(500).send('Error adding new fulfillment date data');
    }
});
//CustomerID, AmountDue, DueDate
app.post('/add-defaulters-c', async (req, res) => {
    const payablesData = req.body; 
    payablesData.DueDate = reformatDate(payablesData.DueDate);
    const values = [payablesData.CustomerID, payablesData.AmountDue, payablesData.DueDate];
    try {
        await db.postNewDefaulters(values);
        res.redirect('/CustomerRelations');
    } catch (error) {
        console.error('Error posting new defaulter data:', error);
        res.status(500).send('Error adding new defaulter data');
    }
});


//for stock details page
//ProductName, Quantity, Price, SupplierID
app.post('/add-stock-s', async (req, res) => {
    const stockData = req.body; 
    const values = [stockData.ProductName, stockData.Quantity, stockData.Price, stockData.SupplierID];
    try {
        await db.postNewStock(values);
        res.redirect('/stockDetails');
    } catch (error) {
        console.error('Error posting new stock data:', error);
        res.status(500).send('Error adding new stock data');
    }
});
//StockID, Quantity, OrderDate, ExpectedDelivery
app.post('/add-reorders-s', async (req, res) => {
    const reordersData = req.body; 
    reordersData.OrderDate = reformatDate(reordersData.OrderDate);
    reordersData.ExpectedDelivery = reformatDate(reordersData.ExpectedDelivery);
    const values = [reordersData.StockID, reordersData.Quantity, reordersData.OrderDate, reordersData.ExpectedDelivery];
    try {
        await db.postNewReorder(values);
        res.redirect('/stockDetails');
    } catch (error) {
        console.error('Error posting new reorders data:', error);
        res.status(500).send('Error adding new reorders data');
    }
});
//SupplierName, ContactInfo, Address
app.post('/add-supplier-s', async (req, res) => {
    const supplierData = req.body; 
    const values = [supplierData.SupplierName, supplierData.ContactInfo, supplierData.Address];
    try {
        await db.postNewSupplier(values);
        res.redirect('/stockDetails');
    } catch (error) {
        console.error('Error posting new supplier data:', error);
        res.status(500).send('Error adding new supplier data');
    }
});
//StockID, Quantity, LastUpdated
app.post('/add-inv-s', async (req, res) => {
    const invData = req.body; 
    invData.LastUpdated = reformatDate(invData.LastUpdated);
    const values = [invData.StockID, invData.Quantity, invData.LastUpdated];
    try {
        await db.postNewInventory(values);
        res.redirect('/stockDetails');
    } catch (error) {
        console.error('Error posting new inventory data:', error);
        res.status(500).send('Error adding new inventory data');
    }
});

//for financials page
//CustomerID, Amount, DueDate
app.post('/add-receivables-f', async (req, res) => {
    const receivablesData = req.body; 
    receivablesData.DueDate = reformatDate(receivablesData.DueDate);
    const values = [receivablesData.CustomerID, receivablesData.Amount, receivablesData.DueDate];
    try {
        await db.postNewAccountsReceivable(values);
        res.redirect('/Financials');
    } catch (error) {
        console.error('Error posting new receivables data:', error);
        res.status(500).send('Error adding new receivables data');
    }
});
//SupplierID, Amount, DueDate
app.post('/add-payables-f', async (req, res) => {
    const payablesData = req.body; 
    payablesData.DueDate = reformatDate(payablesData.DueDate);
    const values = [payablesData.SupplierID, payablesData.Amount, payablesData.DueDate];
    try {
        await db.postNewAccountsPayable(values);
        res.redirect('/Financials');
    } catch (error) {
        console.error('Error posting new payables data:', error);
        res.status(500).send('Error adding new payables data');
    }
});
//Date, TotalSales, TotalCost
app.post('/add-profitful-f', async (req, res) => {
    const profitData = req.body; 
    profitData.Date = reformatDate(profitData.Date);
    const values = [profitData.Date, profitData.TotalSales, profitData.TotalCost];
    try {
        await db.postNewProfitFulfillment(values);
        res.redirect('/Financials');
    } catch (error) {
        console.error('Error posting new profit data:', error);
        res.status(500).send('Error adding new profit data');
    }
});
//CustomerID, AmountDue, DueDate
app.post('/add-defaulters-f', async (req, res) => {
    const payablesData = req.body; 
    payablesData.DueDate = reformatDate(payablesData.DueDate);
    const values = [payablesData.CustomerID, payablesData.AmountDue, payablesData.DueDate];
    try {
        await db.postNewDefaulters(values);
        res.redirect('/Financials');
    } catch (error) {
        console.error('Error posting new defaulter data:', error);
        res.status(500).send('Error adding new defaulter data');
    }
});


//delete delete-row
app.post('/delete-row', async (req, res) => {
    console.log("Deleting row: "+req.body);
    const deleteData = req.body; 
    deleteData.tableName = deleteData.tableName.replace(/'/g, "");
    const values = [deleteData.tableName, deleteData.rowId, deleteData.columnName];
    try {
        await db.deleteRow(values);
        res.redirect('/stockDetails');
    } catch (error) {
        console.error('Error deleting row:', error);
        res.status(500).send('Error deleting row');
    }
});

//for the dashboard
app.post('/submit-dash-order', async (req, res) => {
    try {
        const { 
            productName, amount, fulfillmentDate, customer, 
            newCustomerName, newCustomerAddress, newCustomerContact 
        } = req.body;

        let customerId;

        //check if a new customer is being added
        if (customer === 'new') {
            const c = await db.postNewCustomer([
                newCustomerName,
                newCustomerContact,
                newCustomerAddress
            ]);
            customerId = c.insertId;
        } else {
            const allCustomers = await db.getAllCustomers();
            const existingCustomer = allCustomers.find(c => c.CustomerName === customer);
            if (existingCustomer) {
                customerId = existingCustomer.CustomerID;
            } else {
                throw new Error("Customer not found");
            }
        }
        const allStock = await db.getAllStock();
        const stock = allStock.find(s => s.ProductName === productName);
        if (!stock) {
            throw new Error("Stock item not found");
        }
        const stockId = stock.StockID;


        await db.postNewfulfillmentDate([
            stockId,
            customerId,
            amount,
            fulfillmentDate,
            false 
        ]);


        await db.postNewAccountsReceivable([
            customerId,
            stock.Price * amount,
            fulfillmentDate
        ]);

        //additional logic one day...

        res.redirect('/'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

//for the dashboard - inventory replenishment /submit-replenishment-order
app.post('/submit-replenishment-order', async (req, res) => {
    try {
        const { productName, supplierName, quantity, cost } = req.body;

        const allStock = await db.getAllStock();
        const allSuppliers = await db.getAllSuppliers();

        const stock = allStock.find(s => s.ProductName === productName);
        const supplier = allSuppliers.find(s => s.SupplierName === supplierName);

        if (!stock || !supplier) {
            throw new Error("Stock item or supplier not found");
        }
        await db.postNewReorder([
            stock.StockID,
            quantity,
            new Date().toISOString().slice(0, 10),
            null
        ]);

        await db.postNewAccountsPayable([
            supplier.SupplierID,
            cost * quantity, 
            new Date().toISOString().slice(0, 10)
        ]);

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});





////////////////////////Charts////////////////////////
app.get('/inventory-chart', (req, res) => {
    db.getTotalUnitsReport()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error getting inventory chart data');
        });
});
app.get('/supplierWeight-chart', (req, res) => {
    db.getSupplierWeightReport()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error getting supplier weight chart data');
        });
});
app.get('/rec-and-def-chart', (req, res) => {
    db.getRecievablesAndDefaulters()
        .then(data => {
            res.json(data);
        }).catch(err => {
            console.log(err);
            res.status(500).send('Error getting receivables and defaulters chart data');
        });
});



module.exports = app;