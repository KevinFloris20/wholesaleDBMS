const express = require("express"),
app = express();

//setting view engine to ejs
// this is the live site at gcloud app deploy https://wholesaledbms.ue.r.appspot.com/
app.set("view engine", "ejs");

//add static files
app.use(express.static("public"));

//get and run the routes file
const routes = require("./routes.js");
app.use(routes);

//check for 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!', err);
});


//lisissteen
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
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