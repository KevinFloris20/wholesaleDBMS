const express = require("express"),
app = express();
const path = require("path");

//setting view engine to ejs
// this is the live site at gcloud app deploy https://wholesaledbms.ue.r.appspot.com/
app.set("view engine", "ejs");

//add static files
app.use(express.static("public"));

//add body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public/other')))
app.get('/public/other/site.webmanifest', (req, res) => {
    res.type('application/manifest+json');
    res.sendFile(path.join(__dirname, '..', 'public', 'other', 'site.webmanifest'));
});

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
