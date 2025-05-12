const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */
const http = require("http");
const path = require("path");
require("dotenv").config({
   path: path.resolve(__dirname, "./.env"),
});
const bodyParser = require("body-parser");
process.stdin.setEncoding("utf8"); /* encoding */
const portNumber = 5001;

/* Defining the view/templating engine to use */
app.set("view engine", "ejs");
/* Directory where templates will reside */
app.set("views", path.resolve(__dirname, "views"));

/* Notice public is not part of the url to find files */
const publicPath = path.resolve(__dirname, "public");

/* Routes */
const weatherRequest = require("./routes/weatherRequest");
/* Treating like middleware. Use buildings.js file to handle 
   endpoints that start with /buildings */
app.use("/processRequest", weatherRequest);

/* Adding the middleware, will automatically serve index.html inside public
directory when server starts */
app.use(express.static(publicPath));

app.listen(portNumber);