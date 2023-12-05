const mysql = require('mysql2');
const bodyParser = require('body-parser');

//Connect to DB
require('dotenv').config({path: 'cred.env'});
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const database = process.env.DB_NAME;
const dbConfig = {
    host: host,
    user: user,
    password: password,
    database: database
};
const ghost = process.env.GDB_HOST;
const guser = process.env.GDB_USER;
const gpassword = process.env.GDB_PASS;
const gdatabase = process.env.GDB_NAME;
const gdbConfig = {
    host: ghost,
    user: guser,
    password: gpassword,
    database: gdatabase
};

let db;

// try {
//     db = mysql.createConnection(dbConfig);
//     db.connect((err) => {
//         if (err) {
//             console.log('Local database connection error:', err);
//         } else {
//             console.log('Connected to local database');
//         }
//     });
// } catch (err) {
//     console.log('Local database connection attempt failed:', err);
//     console.log("Trying google database");
//     try {
//         db = mysql.createConnection(gdbConfig);
//         db.connect((err) => {
//             if (err) {
//                 console.log('Google database connection error:', err);
//             } else {
//                 console.log('Connected to google database');
//             }
//         });
//     } catch (err) {
//         console.log('Google database connection attempt failed:', err);
//     }
// }
try {
    db = mysql.createConnection(gdbConfig);
    db.connect((err) => {
        if (err) {
            console.log('Google database connection error:', err);
        } else {
            console.log('Connected to google database');
        }
    });
} catch (err) {
    console.log('Google database connection attempt failed:', err);
}


//Get Queries
const QUERY_GET_ALL_SUPPLIERS = 'SELECT * FROM suppliers;';
const QUERY_GET_ALL_STOCK = 'SELECT * FROM stock;';
const QUERY_GET_ALL_CUSTOMERS = 'SELECT * FROM customers;';
const QUERY_GET_ALL_DEFAULTERS = 'SELECT * FROM defaulters;';
const QUERY_GET_ALL_INVENTORY = 'SELECT * FROM inventory;';
const QUERY_GET_ALL_REORDERS = 'SELECT * FROM reorders;';
const QUERY_GET_ALL_ACCOUNTS_PAYABLE = 'SELECT * FROM accountspayable;';
const QUERY_GET_ALL_ACCOUNTS_RECEIVABLE = 'SELECT * FROM accountsreceivable;';
const QUERY_GET_ALL_PROFIT_FULFILLMENT = 'SELECT * FROM profitfulfillment;';
const QUERY_GET_ALL_FULFILLMENT_DATES = 'SELECT * FROM fulfillmentdate;';

//post queries
//ProductName, Quantity, Price, SupplierID
const QUERY_POST_NEW_STOCK = 'INSERT INTO stock (ProductName, Quantity, Price, SupplierID) VALUES (?, ?, ?, ?);';
//CustomerName, ContactInfo, Address
const QUERY_POST_NEW_CUSTOMER = 'INSERT INTO customers (CustomerName, ContactInfo, Address) VALUES (?, ?, ?);';
//StockID, CustomerID, RequiredQuantity, FulfillmentDate
const QUERY_POST_NEW_FULFILLMENT_DATE = 'INSERT INTO fulfillmentdate (StockID, CustomerID, RequiredQuantity, FulfillmentDate, IsFulfilled) VALUES (?,?,?,?,?);';
//CustomerID, Amount, DueDate
const QUERY_POST_NEW_RECEIVABLES = 'INSERT INTO accountsreceivable (CustomerID, Amount, DueDate) VALUES (?, ?, ?);';
//CustomerID, Amountdue, DueDate
const QUERY_POST_NEW_DEFAULTERS = 'INSERT INTO defaulters (CustomerID, AmountDue, DueDate) VALUES (?, ?, ?);';
//StockID, Quantity, OrderDate, ExpectedDelivery
const QUERY_POST_NEW_REORDER = 'INSERT INTO reorders (StockID, Quantity, OrderDate, ExpectedDelivery) VALUES (?, ?, ?, ?);';
//SupplierName, ContactInfo, Address
const QUERY_POST_NEW_SUPPLIER = 'INSERT INTO suppliers (SupplierName, ContactInfo, Address) VALUES (?, ?, ?);';
//Date, TotalSales, TotalCost
const QUERY_POST_NEW_PROFIT_FULFILLMENT = 'INSERT INTO profitfulfillment (Date, TotalSales, TotalCost) VALUES (?, ?, ?);';
//SupplierID, Amount, DueDate
const QUERY_POST_NEW_ACCOUNTS_PAYABLE = 'INSERT INTO accountspayable (SupplierID, Amount, DueDate) VALUES (?, ?, ?);';
//CustomerID, Amount, DueDate
const QUERY_POST_NEW_ACCOUNTS_RECEIVABLE = 'INSERT INTO accountsreceivable (CustomerID, Amount, DueDate) VALUES (?, ?, ?);';
//StockID, Quantity, LastUpdated
const QUERY_POST_NEW_INVENTORY = 'INSERT INTO inventory (StockID, Quantity, LastUpdated) VALUES (?, ?, ?);';


//report queries
const QUERY_GET_TOTALUNITS_REPORT = `
SELECT stock.ProductName, (stock.Quantity * inventory.Quantity) AS TotalUnits
FROM stock 
JOIN inventory ON stock.StockID = inventory.StockID;
`;
const QUERY_GET_SUPPLIERWEIGHT_REPORT = `
SELECT suppliers.SupplierName, COUNT(stock.StockID) AS ProductCount
FROM suppliers
JOIN stock ON suppliers.SupplierID = stock.SupplierID
GROUP BY suppliers.SupplierName;
`
const QUERY_GET_TOTALACCOUNTSRECEIVABLE = `
SELECT SUM(Amount) AS TotalAccountsReceivable
FROM accountsreceivable;
`
const QUERY_GET_TOTALACCOUNTSPAYABLE = `
SELECT SUM(Amount) AS TotalAccountsPayable
FROM accountspayable;
`
const QUERY_GET_NETACCOUNTS=`
SELECT (SELECT SUM(Amount) FROM accountsreceivable) - (SELECT SUM(Amount) FROM accountspayable) AS NetAccounts
`
const QUERY_GET_TOTALPROFITFUFIL=`
SELECT SUM(TotalSales) - SUM(TotalCost) AS projProfit
FROM profitfulfillment;
`
const QUERY_GET_RECIEVABLES_AND_DEFAULTERS = `
SELECT 
    customers.CustomerName,
    COALESCE(ar.TotalReceivable, 0) AS TotalReceivable,
    COALESCE(df.TotalDefaulted, 0) AS TotalDefaulted
FROM 
    customers
LEFT JOIN 
    (SELECT CustomerID, SUM(Amount) AS TotalReceivable FROM accountsreceivable GROUP BY CustomerID) ar ON customers.CustomerID = ar.CustomerID
LEFT JOIN 
    (SELECT CustomerID, SUM(AmountDue) AS TotalDefaulted FROM defaulters GROUP BY CustomerID) df ON customers.CustomerID = df.CustomerID;

`
const QUERY_GET_ORDER_INV_REPORT =`
SELECT 
    fd.OrderID, 
    fd.StockID, 
    fd.RequiredQuantity, 
    inv.Quantity AS AvailableQuantity,
    (inv.Quantity - fd.RequiredQuantity) AS QuantityDifference
FROM 
    fulfillmentdate fd
JOIN 
    inventory inv ON fd.StockID = inv.StockID;
`

const QUERY_GET_DASH_PROD = `
SELECT 
    s.ProductName,
    s.Price,
    i.Quantity AS InventoryQuantity,
    sup.SupplierName,
    sup.ContactInfo AS SupplierContact,
    sup.Address AS SupplierAddress,
    r.Quantity AS ReorderQuantity,
    r.OrderDate AS ReorderDate,
    r.ExpectedDelivery AS ReorderExpectedDelivery
FROM 
    stock s
LEFT JOIN 
    inventory i ON s.StockID = i.StockID
LEFT JOIN 
    suppliers sup ON s.SupplierID = sup.SupplierID
LEFT JOIN 
    reorders r ON s.StockID = r.StockID;
`


const QUERY_GET_DASH_INVV = `
SELECT 
    s.ProductName,
    sup.SupplierName,
    sup.ContactInfo AS SupplierContact,
    CASE 
        WHEN i.Quantity - IFNULL((SELECT SUM(fd.RequiredQuantity) 
                                  FROM fulfillmentdate fd 
                                  WHERE fd.StockID = s.StockID 
                                  AND fd.IsFulfilled = FALSE), 0) <= 0 THEN 'Yes'
        ELSE 'No'
    END AS NeedsReplenishment
FROM 
    stock s
LEFT JOIN 
    suppliers sup ON s.SupplierID = sup.SupplierID
LEFT JOIN 
    inventory i ON s.StockID = i.StockID;

`
////////////////////////Posts////////////////////////
function postNewStock(newStockData) {
    console.log("Posting: "+newStockData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_STOCK, newStockData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewCustomer(newCustomerData) {
    console.log("Posting: "+newCustomerData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_CUSTOMER, newCustomerData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewfulfillmentDate(newFulfillmentDateData) {
    console.log("Posting: "+newFulfillmentDateData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_FULFILLMENT_DATE, newFulfillmentDateData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewReceivables(newReceivablesData) {
    console.log("Posting: "+newReceivablesData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_RECEIVABLES, newReceivablesData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewDefaulters(newDefaultersData) {
    console.log("Posting: "+newDefaultersData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_DEFAULTERS, newDefaultersData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewReorder(newReorderData) {
    console.log("Posting: "+newReorderData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_REORDER, newReorderData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewSupplier(newSupplierData) {
    console.log("Posting: "+newSupplierData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_SUPPLIER, newSupplierData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewProfitFulfillment(newProfitFulfillmentData) {
    console.log("Posting: "+newProfitFulfillmentData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_PROFIT_FULFILLMENT, newProfitFulfillmentData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewAccountsPayable(newAccountsPayableData) {
    console.log("Posting: "+newAccountsPayableData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_ACCOUNTS_PAYABLE, newAccountsPayableData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewAccountsReceivable(newAccountsReceivableData) {
    console.log("Posting: "+newAccountsReceivableData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_ACCOUNTS_RECEIVABLE, newAccountsReceivableData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function postNewInventory(newInventoryData) {
    console.log("Posting: "+newInventoryData);
    return new Promise((resolve, reject) => {
        db.query(QUERY_POST_NEW_INVENTORY, newInventoryData, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}



////////////////////////Gets////////////////////////
function getAllSuppliers() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_SUPPLIERS, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getAllStock() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_STOCK, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getAllCustomers() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_CUSTOMERS, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getAllDefaulters() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_DEFAULTERS, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getAllInventory() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_INVENTORY, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getAllReorders() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_REORDERS, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getAllAccountsPayable() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_ACCOUNTS_PAYABLE, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getAllAccountsReceivable() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_ACCOUNTS_RECEIVABLE, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getAllProfitFulfillment() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_PROFIT_FULFILLMENT, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getAllFulfillmentDates() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ALL_FULFILLMENT_DATES, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


////////////////////////Delete////////////////////////
function deleteRow(values) {
    const q = "DELETE FROM "+values[0]+" WHERE "+values[2]+" = "+values[1]+";"
    return new Promise((resolve, reject) => {
        db.query(q, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}



////////////////////////Make Report////////////////////////
function getTotalUnitsReport() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_TOTALUNITS_REPORT, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
function getSupplierWeightReport() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_SUPPLIERWEIGHT_REPORT, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
function getTotalAccountsReceivable() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_TOTALACCOUNTSRECEIVABLE, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
function getTotalAccountsPayable() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_TOTALACCOUNTSPAYABLE, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
function getNetAccounts() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_NETACCOUNTS, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
function getTotalProfitFulfillment() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_TOTALPROFITFUFIL, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
function getRecievablesAndDefaulters() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_RECIEVABLES_AND_DEFAULTERS, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
function getOrderInvReport() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_ORDER_INV_REPORT, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
function getDashProducts() {
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_DASH_PROD, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
function getDashInv(){
    return new Promise((resolve, reject) => {
        db.query(QUERY_GET_DASH_INVV, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
module.exports = {
    getAllSuppliers,
    getAllStock,
    getAllCustomers,
    getAllDefaulters,
    getAllInventory,
    getAllReorders,
    getAllAccountsPayable,
    getAllAccountsReceivable,
    getAllProfitFulfillment,
    getAllFulfillmentDates,
    postNewStock,
    postNewCustomer,
    postNewfulfillmentDate,
    postNewReceivables,
    postNewDefaulters,
    postNewReorder,
    postNewSupplier,
    postNewProfitFulfillment,
    postNewAccountsPayable,
    postNewAccountsReceivable,
    postNewInventory,
    deleteRow,
    QUERY_GET_ALL_ACCOUNTS_PAYABLE,
    QUERY_GET_ALL_ACCOUNTS_RECEIVABLE,
    QUERY_GET_ALL_CUSTOMERS,
    QUERY_GET_ALL_DEFAULTERS,
    QUERY_GET_ALL_FULFILLMENT_DATES,
    QUERY_GET_ALL_PROFIT_FULFILLMENT,
    QUERY_GET_ALL_REORDERS,
    QUERY_GET_ALL_STOCK,
    QUERY_GET_ALL_SUPPLIERS,
    QUERY_GET_ALL_INVENTORY,
    QUERY_POST_NEW_ACCOUNTS_PAYABLE,
    QUERY_POST_NEW_ACCOUNTS_RECEIVABLE,
    QUERY_POST_NEW_CUSTOMER,
    QUERY_POST_NEW_DEFAULTERS,
    QUERY_POST_NEW_FULFILLMENT_DATE,
    QUERY_POST_NEW_PROFIT_FULFILLMENT,
    QUERY_POST_NEW_RECEIVABLES,
    QUERY_POST_NEW_REORDER,
    QUERY_POST_NEW_STOCK,
    QUERY_POST_NEW_SUPPLIER,
    QUERY_POST_NEW_INVENTORY,
    getTotalUnitsReport,
    QUERY_GET_TOTALUNITS_REPORT,
    getSupplierWeightReport,
    QUERY_GET_SUPPLIERWEIGHT_REPORT,
    getTotalAccountsReceivable,
    QUERY_GET_TOTALACCOUNTSRECEIVABLE,
    getTotalAccountsPayable,
    QUERY_GET_TOTALACCOUNTSPAYABLE,
    getNetAccounts,
    QUERY_GET_NETACCOUNTS,
    getTotalProfitFulfillment,
    QUERY_GET_TOTALPROFITFUFIL,
    getRecievablesAndDefaulters,
    QUERY_GET_RECIEVABLES_AND_DEFAULTERS,
    getOrderInvReport,
    QUERY_GET_ORDER_INV_REPORT,
    getDashProducts,
    QUERY_GET_DASH_PROD,
    getDashInv,
    QUERY_GET_DASH_INVV
};


// //run all the code
// getAllSuppliers((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });

// getAllStock((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });

// getAllCustomers((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });

// getAllDefaulters((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });

// getAllInventory((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });

// getAllReorders((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });

// getAllAccountsPayable((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });

// getAllAccountsReceivable((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });

// getAllProfitFulfillment((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });

// getAllFulfillmentDates((err, results) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//     }
// });





