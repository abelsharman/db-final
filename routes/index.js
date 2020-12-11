const Router = require("express").Router;
const api = Router();

const booksRoute = require("./books");
const main = require("./main");


api.use("/", main);
api.use("/books", booksRoute);


module.exports = api;