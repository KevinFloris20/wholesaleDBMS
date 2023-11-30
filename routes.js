const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//route for index page
app.get("/", function (req, res) {
    res.render("index");
});



//   getAllSuppliers,
//   getAllStock,
//   getAllCustomers,
//   getAllDefaulters,
//   getAllInventory,
//   getAllReorders,
//   getAllAccountsPayable,
//   getAllAccountsReceivable,
//   getAllProfitFulfillment,
//   getAllFulfillmentDates
  
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





////////////////////////Posts////////////////////////


// Function to reformat the date to SQL acceptable format (yyyy-mm-dd)
function reformatDate(dateStr) {
    let parts = dateStr.match(/(\d+)/g);  // Extracts the date parts

    // Basic validation to check if there are exactly three parts for month, day, year
    if (!parts || parts.length !== 3) {
        return null; // Or some default date, as per your handling strategy
    }

    let day, month, year;

    if (dateStr.includes('/')) {
        // Check if format is DD/MM/YYYY or MM/DD/YYYY
        // Assuming the first part is less than or equal to 12, treat it as month
        if (parseInt(parts[0]) <= 12) {
            // Format is MM/DD/YYYY
            [month, day, year] = parts;
        } else {
            // Format is DD/MM/YYYY
            [day, month, year] = parts;
        }
    } else if (dateStr.includes('-')) {
        // Assuming format is YYYY-MM-DD or DD-MM-YYYY
        if (parts[0].length === 4) {
            // Format is YYYY-MM-DD
            [year, month, day] = parts;
        } else {
            // Format is DD-MM-YYYY
            [day, month, year] = parts;
        }
    } else {
        // Handle other formats or set a default
        return null; // Or some default date, as per your handling strategy
    }

    // Pad day and month with zero if they are single digit
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');

    // Reconstruct the date in YYYY-MM-DD format
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