const express = require("express"),
app = express();

//setting view engine to ejs
app.set("view engine", "ejs");

//add static files
app.use(express.static("public"));

//get and run the routes file
const routes = require("./routes.js");
app.use(routes);

//lisissteen
app.listen(8080, function () {
  console.log("Server is running on port 8080 ");
});

// const express = require("express"),
// app = express();

// //setting view engine to ejs
// app.set("view engine", "ejs");

// //route for index page
// app.get("/", function (req, res) {
//   res.render("index");
// });

// //route for magic page
// app.get("/magic", function (req, res) {
//   res.render("magic");
// });

// app.listen(8080, function () {
//   console.log("Server is running on port 8080 ");
// });